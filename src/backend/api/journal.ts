import { journalService, JournalEntry } from '../services/journalService';

export class JournalAPI {
  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    return await journalService.createEntry(entry);
  }

  async getEntry(id: string): Promise<JournalEntry> {
    return await journalService.getEntry(id);
  }

  async getUserEntries(userId: string): Promise<JournalEntry[]> {
    return await journalService.getUserEntries(userId);
  }

  async updateEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    return await journalService.updateEntry(id, entry);
  }

  async deleteEntry(id: string): Promise<void> {
    await journalService.deleteEntry(id);
  }

  async searchEntries(userId: string, query: string): Promise<JournalEntry[]> {
    return await journalService.searchEntries(userId, query);
  }

  async getEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<JournalEntry[]> {
    return await journalService.getEntriesByDateRange(userId, startDate, endDate);
  }

  async getAnalytics(userId: string) {
    return await journalService.getAnalytics(userId);
  }
}

export const journalAPI = new JournalAPI();
