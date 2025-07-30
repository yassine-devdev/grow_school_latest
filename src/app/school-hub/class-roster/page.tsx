'use client';

import React, { useState } from 'react';
import ClassRosterView from '@/components/school-hub/ClassRosterView';

export default function ClassRosterPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  return (
    <div className="h-screen">
      <ClassRosterView 
        selectedClassId={selectedClassId}
        onClassSelect={setSelectedClassId}
      />
    </div>
  );
}