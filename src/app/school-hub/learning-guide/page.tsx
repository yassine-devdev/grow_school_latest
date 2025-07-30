// School Hub Learning Guide page - using new AI-Powered Learning Guide

'use client';

import React from 'react';
import { LearningGuide } from '../../../components/learning-guide/LearningGuide';

export default function LearningGuidePage() {
  // For testing purposes, using a mock student ID
  const studentId = 'test-student-123';

  return <LearningGuide studentId={studentId} />;
}