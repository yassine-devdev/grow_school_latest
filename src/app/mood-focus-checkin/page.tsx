'use client';

import React from 'react';
import MoodFocusCheckIn from '../../components/wellness/MoodFocusCheckIn';

export default function MoodFocusCheckInPage() {
  const handleCheckInComplete = (checkIn: any) => {
    console.log('Check-in completed:', checkIn);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mood + Focus Check-In
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Take a moment to check in with yourself and track your wellness journey.
          </p>
        </div>

        <MoodFocusCheckIn
          userId="user-1"
          onCheckInComplete={handleCheckInComplete}
          showTrends={true}
          compact={false}
        />

        {/* Compact Version Demo */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Compact Version
          </h2>
          <div className="max-w-md">
            <MoodFocusCheckIn
              userId="user-1"
              onCheckInComplete={handleCheckInComplete}
              showTrends={false}
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}