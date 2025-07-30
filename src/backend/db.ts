// Database abstraction layer
import PocketBase from 'pocketbase';
import { conflictDetector } from '../lib/conflict-detection';
import { spawn } from 'child_process';
import path from 'path';

// Define proper types for database operations
interface DatabaseRecord {
  id: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

interface QueryOptions {
  sort?: string;
  filter?: string;
  expand?: string;
  page?: number;
  perPage?: number;
}

interface UpdateOptions {
  checkVersion?: boolean;
}

// In-memory storage for testing
class TestDatabase {
  private collections: Map<string, Map<string, DatabaseRecord>> = new Map();
  private idCounter = 1;

  private getCollection(name: string): Map<string, DatabaseRecord> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  async create(collection: string, data: Partial<DatabaseRecord>): Promise<DatabaseRecord> {
    const id = `test_${this.idCounter++}`;
    const record: DatabaseRecord = { id, ...data, created: new Date().toISOString() };
    this.getCollection(collection).set(id, record);
    return record;
  }

  async getById(collection: string, id: string): Promise<DatabaseRecord> {
    const record = this.getCollection(collection).get(id);
    if (!record) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }
    return record;
  }

  async getAll(collection: string, options?: QueryOptions): Promise<DatabaseRecord[]> {
    const records = Array.from(this.getCollection(collection).values());

    // Apply basic filtering if options are provided
    if (options?.filter) {
      console.log(`Applying filter: ${options.filter} to ${records.length} records`);
    }

    return records;
  }

  async update(collection: string, id: string, data: Partial<DatabaseRecord>): Promise<DatabaseRecord> {
    const existing = this.getCollection(collection).get(id);
    if (!existing) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }
    const updated: DatabaseRecord = { ...existing, ...data, updated: new Date().toISOString() };
    this.getCollection(collection).set(id, updated);
    return updated;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const success = this.getCollection(collection).delete(id);
    if (!success) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }
    return true;
  }

  async search(collection: string, filter: string, options?: QueryOptions): Promise<DatabaseRecord[]> {
    const records = Array.from(this.getCollection(collection).values());

    // Log the search operation for debugging
    console.log(`Searching ${collection} with filter: ${filter}, options:`, options);

    // Simple filter implementation for testing
    if (filter.includes('isPublic = true')) {
      return records.filter(r => r.isPublic === true);
    }
    if (filter.includes('role = "teacher"')) {
      return records.filter(r => r.role === 'teacher');
    }
    if (filter.includes('name =')) {
      const nameMatch = filter.match(/name = "([^"]+)"/);
      if (nameMatch) {
        return records.filter(r => r.name === nameMatch[1]);
      }
    }
    return records;
  }
}

// Initialize database based on environment
const testDb = new TestDatabase();
const pb = process.env.NODE_ENV === 'test' ? null : new PocketBase('http://127.0.0.1:8090');

// Start PocketBase server if not running
async function startPocketBase() {
  if (process.env.NODE_ENV !== 'test') {
    try {
      // Check if PocketBase is already running
      const response = await fetch('http://127.0.0.1:8090/api/health');
      if (response.ok) {
        console.log('PocketBase is already running');
        return;
      }
    } catch (error) {
      // PocketBase is not running, start it
      console.log('Starting PocketBase server...', error);

      const pbPath = path.join(process.cwd(), 'src/backend/pocketbase/pocketbase.exe');
      const pbProcess = spawn(pbPath, ['serve'], {
        cwd: path.join(process.cwd(), 'src/backend/pocketbase'),
        detached: true,
        stdio: 'ignore'
      });

      pbProcess.unref();
      console.log('PocketBase server started');

      // Wait a moment for the server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Auto-start PocketBase
startPocketBase().catch(console.error);

export class Database {
  private pb: PocketBase | null;
  private testDb: TestDatabase;

  constructor() {
    this.pb = pb;
    this.testDb = testDb;
  }

  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'test' || !this.pb;
  }

  // Generic CRUD operations
  async create(collection: string, data: Partial<DatabaseRecord>): Promise<DatabaseRecord> {
    if (this.isTestMode()) {
      return await this.testDb.create(collection, data);
    }

    try {
      // Check for duplicates before creating
      if (data.name || data.title || data.email) {
        const existingRecords = await this.getAll(collection);
        const uniqueFields = ['name', 'title', 'email'].filter(field => data[field as keyof DatabaseRecord]);

        const conflict = conflictDetector.detectDuplicate(
          collection,
          data,
          existingRecords,
          uniqueFields
        );

        if (conflict) {
          throw new Error(`Duplicate ${collection} detected: ${conflict.description}`);
        }
      }

      return await this.pb!.collection(collection).create(data);
    } catch (error) {
      console.error(`Error creating record in ${collection}:`, error);
      throw error;
    }
  }

  async getById(collection: string, id: string): Promise<DatabaseRecord> {
    if (this.isTestMode()) {
      return await this.testDb.getById(collection, id);
    }

    try {
      return await this.pb!.collection(collection).getOne(id);
    } catch (error) {
      console.error(`Error getting record ${id} from ${collection}:`, error);
      throw error;
    }
  }

  async getAll(collection: string, options?: QueryOptions): Promise<DatabaseRecord[]> {
    if (this.isTestMode()) {
      return await this.testDb.getAll(collection, options);
    }

    try {
      return await this.pb!.collection(collection).getFullList(options);
    } catch (error: unknown) {
      // Handle missing collection gracefully
      const errorObj = error as { status?: number; message?: string };
      if (errorObj.status === 404 || errorObj.message?.includes('Missing or invalid collection')) {
        console.warn(`Collection ${collection} not found, returning empty array`);
        return [];
      }
      console.error(`Error getting records from ${collection}:`, error);
      throw error;
    }
  }

  async update(collection: string, id: string, data: Partial<DatabaseRecord>, options?: UpdateOptions): Promise<DatabaseRecord> {
    if (this.isTestMode()) {
      return await this.testDb.update(collection, id, data);
    }

    try {
      // Check for version conflicts if enabled
      if (options?.checkVersion && data.version !== undefined) {
        const currentRecord = await this.pb!.collection(collection).getOne(id);

        const conflict = conflictDetector.detectVersionConflict(
          id,
          data.version as number,
          (currentRecord.version as number) || 0,
          data,
          currentRecord
        );

        if (conflict) {
          throw new Error(`Version conflict detected: ${conflict.description}`);
        }
      }

      return await this.pb!.collection(collection).update(id, data);
    } catch (error) {
      console.error(`Error updating record ${id} in ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection: string, id: string): Promise<boolean> {
    if (this.isTestMode()) {
      return await this.testDb.delete(collection, id);
    }

    try {
      await this.pb!.collection(collection).delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting record ${id} from ${collection}:`, error);
      throw error;
    }
  }

  async search(collection: string, filter: string, options?: QueryOptions): Promise<DatabaseRecord[]> {
    if (this.isTestMode()) {
      return await this.testDb.search(collection, filter, options);
    }

    try {
      return await this.pb!.collection(collection).getFullList({
        filter,
        ...options
      });
    } catch (error: unknown) {
      // Handle missing collection gracefully
      const errorObj = error as { status?: number; message?: string };
      if (errorObj.status === 404 || errorObj.message?.includes('Missing or invalid collection')) {
        console.warn(`Collection ${collection} not found, returning empty array`);
        return [];
      }
      console.error(`Error searching ${collection} with filter ${filter}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async authenticate(email: string, password: string): Promise<{ user: DatabaseRecord; token: string }> {
    if (this.isTestMode()) {
      // Simple test authentication
      const users = await this.testDb.search('users', `email = "${email}"`);
      if (users.length > 0) {
        return { user: users[0], token: 'test_token' };
      }
      throw new Error('Invalid credentials');
    }

    try {
      const authResult = await this.pb!.collection('users').authWithPassword(email, password);
      return { user: authResult.record, token: authResult.token };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  get isAuthenticated(): boolean {
    if (this.isTestMode()) {
      return true; // Always authenticated in test mode
    }
    return this.pb!.authStore.isValid;
  }

  get currentUser(): DatabaseRecord | null {
    if (this.isTestMode()) {
      return { id: 'test_user', email: 'test@example.com' };
    }
    // Use the newer 'record' property instead of deprecated 'model'
    return this.pb!.authStore.record as DatabaseRecord | null;
  }

  logout(): void {
    if (this.pb) {
      this.pb.authStore.clear();
    }
  }
}

// Export singleton instance
export const db = new Database();
export default db;
