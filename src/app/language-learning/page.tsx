'use client';

import React from 'react';
import LanguageLearningDashboard from '../../components/language-learning/LanguageLearningDashboard';

export default function LanguageLearningPage() {
  // In a real app, you would get the userId from authentication context
  const userId = 'user_1';

  return <LanguageLearningDashboard userId={userId} />;
}