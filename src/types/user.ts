import { BaseEntity, UserRole } from './base';

// User types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sms: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityTracking: boolean;
    dataSharing: boolean;
  };
}

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  interests?: string[];
  skills?: string[];
  achievements?: string[];
}

// Authentication types
export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  isAuthenticated: boolean;
  expiresAt: string;
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  canAccess: (resource: string, action: string) => boolean;
}