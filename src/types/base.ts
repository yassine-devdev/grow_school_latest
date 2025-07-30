// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// Common utility types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Visibility = 'public' | 'private' | 'restricted';

// User role types
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Mood and wellness level types
export type MoodLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type FocusLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type EnergyLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type StressLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

// Date and time utilities
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  timezone?: string;
}

// File and media types
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

// Search and filter types
export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T = any> {
  id: string;
  title: string;
  description?: string;
  type: string;
  data: T;
  score?: number;
  highlights?: string[];
}

// Notification types
export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  duration?: number;
  persistent?: boolean;
}

// Theme and UI types
export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Generic CRUD operations
export interface CrudOperations<T> {
  create: (data: Omit<T, keyof BaseEntity>) => Promise<T>;
  read: (id: string) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (query?: SearchQuery) => Promise<ApiResponse<T[]>>;
}

// Event types for real-time updates
export interface SystemEvent<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}