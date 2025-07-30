import { db } from '../../db';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  recurrence?: string;
  location?: string;
  attendees?: string[];
  created?: string;
  updated?: string;
}

export class CalendarRepository {
  private collection = 'calendar_events';

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return await db.create(this.collection, event);
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return await db.getById(this.collection, id);
  }

  async getAllEvents(): Promise<CalendarEvent[]> {
    return await db.getAll(this.collection, {
      sort: 'start'
    });
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return await db.search(this.collection, `start >= "${startDate}" && end <= "${endDate}"`);
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return await db.update(this.collection, id, event);
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(this.collection, id);
  }

  async searchEvents(query: string): Promise<CalendarEvent[]> {
    return await db.search(this.collection, `title ~ "${query}" || description ~ "${query}"`);
  }

  async getRecurringEvents(): Promise<CalendarEvent[]> {
    return await db.search(this.collection, 'recurrence != ""');
  }
}

export const calendarRepository = new CalendarRepository();
