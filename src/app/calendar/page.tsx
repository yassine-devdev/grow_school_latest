
import CalendarModule from '@/components/modules/CalendarModule';
import { fetchCalendarEvents } from '@/lib/data/calendar';

export default async function CalendarPage() {
    // Fetch initial events for the current month on the server
    const today = new Date();
    const initialYear = today.getFullYear();
    const initialMonth = today.getMonth(); // 0-indexed
    const initialEvents = await fetchCalendarEvents(initialYear, initialMonth);
    
    return (
        <CalendarModule 
            initialEvents={initialEvents} 
            initialYear={initialYear}
            initialMonth={initialMonth}
        />
    );
}