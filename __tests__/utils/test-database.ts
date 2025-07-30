import PocketBase from 'pocketbase';
import { nanoid } from 'nanoid';

export interface TestDatabaseConfig {
  url?: string;
  adminEmail?: string;
  adminPassword?: string;
  testPrefix?: string;
}

export class TestDatabase {
  private pb: PocketBase;
  private testPrefix: string;
  private createdCollections: string[] = [];
  private createdRecords: Array<{ collection: string; id: string }> = [];

  constructor(config: TestDatabaseConfig = {}) {
    this.pb = new PocketBase(config.url || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
    this.testPrefix = config.testPrefix || `test_${nanoid(8)}`;
  }

  async initialize(): Promise<void> {
    try {
      // Authenticate as admin for test setup
      await this.pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || 'admin@test.com',
        process.env.POCKETBASE_ADMIN_PASSWORD || 'testpassword123'
      );
    } catch (error) {
      console.warn('Admin authentication failed, continuing with existing auth:', error);
    }
  }

  async createTestUser(userData: Partial<any> = {}): Promise<any> {
    const defaultUser = {
      email: `test_${nanoid(8)}@example.com`,
      password: 'testpassword123',
      passwordConfirm: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      verified: true,
      ...userData
    };

    try {
      const user = await this.pb.collection('users').create(defaultUser);
      this.createdRecords.push({ collection: 'users', id: user.id });
      return user;
    } catch (error) {
      console.error('Failed to create test user:', error);
      throw error;
    }
  }

  async authenticateTestUser(email: string, password: string): Promise<any> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Failed to authenticate test user:', error);
      throw error;
    }
  }

  async createTestRecord(collection: string, data: any): Promise<any> {
    try {
      const record = await this.pb.collection(collection).create({
        ...data,
        // Add test prefix to identify test records
        _test_id: this.testPrefix
      });
      this.createdRecords.push({ collection, id: record.id });
      return record;
    } catch (error) {
      console.error(`Failed to create test record in ${collection}:`, error);
      throw error;
    }
  }

  async updateTestRecord(collection: string, id: string, data: any): Promise<any> {
    try {
      return await this.pb.collection(collection).update(id, data);
    } catch (error) {
      console.error(`Failed to update test record in ${collection}:`, error);
      throw error;
    }
  }

  async getTestRecord(collection: string, id: string): Promise<any> {
    try {
      return await this.pb.collection(collection).getOne(id);
    } catch (error) {
      console.error(`Failed to get test record from ${collection}:`, error);
      throw error;
    }
  }

  async deleteTestRecord(collection: string, id: string): Promise<void> {
    try {
      await this.pb.collection(collection).delete(id);
      // Remove from tracking
      this.createdRecords = this.createdRecords.filter(
        record => !(record.collection === collection && record.id === id)
      );
    } catch (error) {
      console.error(`Failed to delete test record from ${collection}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Clean up all created records in reverse order
    for (const record of [...this.createdRecords].reverse()) {
      try {
        await this.pb.collection(record.collection).delete(record.id);
      } catch (error) {
        console.warn(`Failed to cleanup record ${record.id} from ${record.collection}:`, error);
      }
    }

    // Clear tracking arrays
    this.createdRecords = [];
    this.createdCollections = [];

    // Clear auth
    this.pb.authStore.clear();
  }

  getPocketBase(): PocketBase {
    return this.pb;
  }

  getAuthToken(): string | null {
    return this.pb.authStore.token;
  }

  getCurrentUser(): any {
    return this.pb.authStore.model;
  }

  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }
}

// Global test database instance
let globalTestDb: TestDatabase | null = null;

export function getTestDatabase(): TestDatabase {
  if (!globalTestDb) {
    globalTestDb = new TestDatabase();
  }
  return globalTestDb;
}

export async function setupTestDatabase(): Promise<TestDatabase> {
  const testDb = getTestDatabase();
  await testDb.initialize();
  return testDb;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (globalTestDb) {
    await globalTestDb.cleanup();
    globalTestDb = null;
  }
}