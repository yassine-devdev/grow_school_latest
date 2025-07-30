// Re-export all types from domain-specific files
export * from './base';
export * from './user';
export * from './wellness';
export * from './gamification';

// Legacy types from the original types.ts file (for backward compatibility)
import React from 'react';

export enum AppModuleId {
  Dashboard = 'DASHBOARD',
  Analytics = 'ANALYTICS',
  SchoolHub = 'SCHOOL_HUB',
  Communications = 'COMMUNICATIONS',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  ConciergeAI = 'CONCIERGE_AI',
  SystemSettings = 'SYSTEM_SETTINGS',
  Marketplace = 'MARKETPLACE',
}

export enum OverlayId {
  Lifestyle = 'LIFESTYLE',
  Gamification = 'GAMIFICATION',
  Hobbies = 'HOBBIES',
  Media = 'MEDIA',
  Studio = 'STUDIO',
  Marketplace = 'MARKETPLACE',
}

export interface AppModule {
  id: AppModuleId;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

export interface OverlayApp {
  id: OverlayId;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<{ onClose: () => void; onMinimize: () => void; }>;
}

export interface Product {
  id: string | number;
  title: string;
  category: string;
  price: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Dashboard Types
export interface StatCardData {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface EngagementChartDataPoint {
  name: string;
  uv: number;
  pv: number;
}

// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Marketplace Types
export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  rating?: number;
  image?: string;
  [key: string]: unknown;
}

// Media Types
export interface MediaContent {
  id: string;
  title: string;
  type: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  description?: string;
  [key: string]: unknown;
}

// School Hub Types
export interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  status?: string;
  [key: string]: unknown;
}

export interface SchoolHubDashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  recentActivities: unknown[];
  [key: string]: unknown;
}

// Communication Types
export interface Email {
  id: string;
  sender: string;
  recipient?: string;
  subject: string;
  body: string;
  folder: string;
  timestamp?: string;
  isRead?: boolean;
  attachments?: string[];
  [key: string]: unknown;
}

export interface EmailFolder {
  name: string;
  icon: string;
  count: number;
}

// Calendar Types
export type CalendarEventType = 'meeting' | 'exam' | 'task' | 'reminder' | 'holiday';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  start?: string;
  end?: string;
  type: CalendarEventType;
  time?: string;
  location?: string;
  attendees?: string[];
  [key: string]: unknown;
}

// AI Types
export interface AiInsight {
  id: string;
  title: string;
  content: string;
  type: string;
  confidence: number;
  createdAt: string;
  [key: string]: unknown;
}

// Messaging Types
export interface MessageThread {
  id: string;
  title: string;
  participants: string[];
  lastMessage?: string;
  lastActivity: string;
  isRead: boolean;
  [key: string]: unknown;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  sender: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  [key: string]: unknown;
}

// Web Search Types
export interface WebSource {
  uri: string;
  title: string;
}

// Module and Overlay Types
export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: string;
  category: string;
  isEnabled: boolean;
  permissions?: string[];
  settings?: Record<string, any>;
}

export interface OverlayDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: string;
  category: string;
  isEnabled: boolean;
  permissions?: string[];
  settings?: Record<string, any>;
}

// Recurrence Pattern Types
export interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  occurrences?: number;
}

// Thread and Message Types (Extended)
export interface ThreadUpdateEvent {
  type: 'message_added' | 'message_updated' | 'message_deleted' | 'thread_updated';
  threadId: string;
  message?: ThreadMessage;
  thread?: MessageThread;
  timestamp: string;
}