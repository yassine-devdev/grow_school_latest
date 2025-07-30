import { calendarRepository, CalendarEvent } from '../repositories/pocketbase/calendarRepository';

export class CalendarService {
  async createEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return await calendarRepository.createEvent(eventData);
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return await calendarRepository.getEvent(id);
  }

  async getAllEvents(): Promise<CalendarEvent[]> {
    return await calendarRepository.getAllEvents();
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return await calendarRepository.getEventsByDateRange(startDate, endDate);
  }

  async updateEvent(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return await calendarRepository.updateEvent(id, eventData);
  }

  async deleteEvent(id: string): Promise<void> {
    await calendarRepository.deleteEvent(id);
  }

  async searchEvents(query: string): Promise<CalendarEvent[]> {
    return await calendarRepository.searchEvents(query);
  }

  async getRecurringEvents(): Promise<CalendarEvent[]> {
    return await calendarRepository.getRecurringEvents();
  }

  async generateRecurrencePattern(pattern: string): Promise<string[]> {
    // Mock implementation for recurrence pattern generation
    const dates: string[] = [];
    const baseDate = new Date();
    
    switch (pattern) {
      case 'daily':
        for (let i = 0; i < 30; i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString());
        }
        break;
      case 'weekly':
        for (let i = 0; i < 12; i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + (i * 7));
          dates.push(date.toISOString());
        }
        break;
      case 'monthly':
        for (let i = 0; i < 12; i++) {
          const date = new Date(baseDate);
          date.setMonth(date.getMonth() + i);
          dates.push(date.toISOString());
        }
        break;
      default:
        dates.push(baseDate.toISOString());
    }
    
    return dates;
  }
}

export const calendarService = new CalendarService();
