'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
}

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Math Class',
      description: 'Algebra and Geometry',
      start: '2024-01-15T09:00:00',
      end: '2024-01-15T10:30:00',
      location: 'Room 101'
    },
    {
      id: '2',
      title: 'Science Lab',
      description: 'Chemistry Experiment',
      start: '2024-01-16T14:00:00',
      end: '2024-01-16T15:30:00',
      location: 'Lab 2'
    },
    {
      id: '3',
      title: 'Study Group',
      description: 'History Review Session',
      start: '2024-01-17T16:00:00',
      end: '2024-01-17T18:00:00',
      location: 'Library'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-300">Manage your schedule and events</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Icons.Plus size={20} />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Icons.ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Icons.ChevronRight size={20} />
            </button>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
          {viewMode === 'month' && (
            <div className="h-full flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-gray-300 font-medium">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <div
                    key={index}
                    className={`p-2 min-h-[100px] border border-white/10 rounded cursor-pointer transition-colors ${
                      date ? 'hover:bg-white/5' : ''
                    } ${
                      date && date.toDateString() === new Date().toDateString()
                        ? 'bg-purple-600/20 border-purple-500/50'
                        : ''
                    }`}
                    onClick={() => {
                      if (date) {
                        setSelectedDate(date);
                        setShowEventModal(true);
                      }
                    }}
                  >
                    {date && (
                      <>
                        <div className="text-white font-medium mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {getEventsForDate(date).slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="text-xs bg-blue-600/30 text-blue-200 px-1 py-0.5 rounded truncate"
                            >
                              {event.title}
                            </div>
                          ))}
                          {getEventsForDate(date).length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{getEventsForDate(date).length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {viewMode === 'week' && (
            <div className="text-center text-white py-20">
              <Icons.Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-medium mb-2">Week View</h3>
              <p className="text-gray-400">Week view coming soon...</p>
            </div>
          )}
          
          {viewMode === 'day' && (
            <div className="text-center text-white py-20">
              <Icons.Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-medium mb-2">Day View</h3>
              <p className="text-gray-400">Day view coming soon...</p>
            </div>
          )}
        </div>

        {/* Today's Events Sidebar */}
        <div className="mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Today's Events</h3>
            <div className="space-y-2">
              {getEventsForDate(new Date()).length > 0 ? (
                getEventsForDate(new Date()).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{event.title}</div>
                      <div className="text-gray-400 text-sm">
                        {formatTime(event.start)} - {formatTime(event.end)}
                        {event.location && ` • ${event.location}`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No events scheduled for today
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Events for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-white font-medium">{event.title}</div>
                    <div className="text-gray-400 text-sm mt-1">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    {event.location && (
                      <div className="text-gray-400 text-sm">📍 {event.location}</div>
                    )}
                    {event.description && (
                      <div className="text-gray-300 text-sm mt-2">{event.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No events scheduled for this date
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
