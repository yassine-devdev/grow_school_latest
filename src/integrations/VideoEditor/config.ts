/**
 * Video Editor Configuration
 * 
 * Centralized configuration for the video editor integration.
 * This file contains all the settings, feature flags, and constants
 * used throughout the video editor integration.
 */

import type { VideoEditorConfig } from './types';

/**
 * Default configuration for the video editor
 */
export const DEFAULT_VIDEO_EDITOR_CONFIG: VideoEditorConfig = {
  width: 1280,
  height: 720,
  theme: 'dark',
  features: {
    enableAI: false,
    enableExport: true,
    enableImport: true,
    enableCollaboration: false,
  },
  performance: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 600, // 10 minutes
    previewQuality: 'medium',
  },
};

/**
 * Environment-specific configuration
 */
export const VIDEO_EDITOR_ENV_CONFIG = {
  development: {
    ...DEFAULT_VIDEO_EDITOR_CONFIG,
    features: {
      ...DEFAULT_VIDEO_EDITOR_CONFIG.features,
      enableAI: true, // Enable AI features in development
    },
    performance: {
      ...DEFAULT_VIDEO_EDITOR_CONFIG.performance,
      maxFileSize: 500 * 1024 * 1024, // 500MB in development
      maxDuration: 1800, // 30 minutes in development
    },
  },
  production: {
    ...DEFAULT_VIDEO_EDITOR_CONFIG,
    features: {
      ...DEFAULT_VIDEO_EDITOR_CONFIG.features,
      enableAI: false, // Disable AI in production for now
    },
  },
  test: {
    ...DEFAULT_VIDEO_EDITOR_CONFIG,
    width: 640,
    height: 360,
    performance: {
      ...DEFAULT_VIDEO_EDITOR_CONFIG.performance,
      maxFileSize: 10 * 1024 * 1024, // 10MB for tests
      maxDuration: 60, // 1 minute for tests
    },
  },
} as const;

/**
 * Get configuration for current environment
 */
export function getVideoEditorConfig(): VideoEditorConfig {
  const env = process.env.NODE_ENV || 'development';
  return VIDEO_EDITOR_ENV_CONFIG[env as keyof typeof VIDEO_EDITOR_ENV_CONFIG] || DEFAULT_VIDEO_EDITOR_CONFIG;
}

/**
 * Supported file formats
 */
export const SUPPORTED_FORMATS = {
  video: {
    input: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    output: ['mp4', 'webm', 'mov'],
  },
  audio: {
    input: ['mp3', 'wav', 'aac', 'ogg', 'm4a'],
    output: ['mp3', 'wav', 'aac'],
  },
  image: {
    input: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    output: ['jpg', 'png', 'webp'],
  },
} as const;

/**
 * Export quality presets
 */
export const EXPORT_PRESETS = {
  low: {
    resolution: { width: 640, height: 360 },
    frameRate: 24,
    bitrate: 500000, // 500kbps
    quality: 'low' as const,
  },
  medium: {
    resolution: { width: 1280, height: 720 },
    frameRate: 30,
    bitrate: 2000000, // 2Mbps
    quality: 'medium' as const,
  },
  high: {
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    bitrate: 5000000, // 5Mbps
    quality: 'high' as const,
  },
  ultra: {
    resolution: { width: 3840, height: 2160 },
    frameRate: 60,
    bitrate: 15000000, // 15Mbps
    quality: 'ultra' as const,
  },
} as const;

/**
 * Theme configurations
 */
export const THEME_CONFIG = {
  light: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    border: '#e2e8f0',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    border: '#334155',
  },
} as const;

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // File size warnings (in bytes)
  fileSizeWarning: 50 * 1024 * 1024, // 50MB
  fileSizeError: 200 * 1024 * 1024, // 200MB
  
  // Duration warnings (in seconds)
  durationWarning: 300, // 5 minutes
  durationError: 1200, // 20 minutes
  
  // Memory usage (in MB)
  memoryWarning: 512,
  memoryError: 1024,
  
  // Export time (in seconds)
  exportTimeWarning: 60,
  exportTimeError: 300,
} as const;

/**
 * Feature flags for gradual rollout
 */
export const FEATURE_FLAGS = {
  // Core features
  ENABLE_VIDEO_EDITOR: true,
  ENABLE_EXPORT: true,
  ENABLE_IMPORT: true,
  
  // Advanced features
  ENABLE_AI_FEATURES: process.env.NODE_ENV === 'development',
  ENABLE_COLLABORATION: false,
  ENABLE_CLOUD_STORAGE: false,
  ENABLE_LIVE_PREVIEW: true,
  
  // Experimental features
  ENABLE_WEBGL_ACCELERATION: false,
  ENABLE_WASM_PROCESSING: false,
  ENABLE_REAL_TIME_COLLABORATION: false,
} as const;

/**
 * API endpoints for video editor services
 */
export const API_ENDPOINTS = {
  upload: '/api/video-editor/upload',
  export: '/api/video-editor/export',
  projects: '/api/video-editor/projects',
  assets: '/api/video-editor/assets',
  templates: '/api/video-editor/templates',
} as const;

/**
 * Error codes and messages
 */
export const ERROR_CODES = {
  INITIALIZATION_FAILED: 'Failed to initialize video editor',
  PROJECT_LOAD_FAILED: 'Failed to load project',
  PROJECT_SAVE_FAILED: 'Failed to save project',
  EXPORT_FAILED: 'Failed to export video',
  UPLOAD_FAILED: 'Failed to upload file',
  INVALID_FILE_FORMAT: 'Invalid file format',
  FILE_TOO_LARGE: 'File size exceeds limit',
  DURATION_TOO_LONG: 'Video duration exceeds limit',
  NETWORK_ERROR: 'Network connection error',
  PERMISSION_DENIED: 'Permission denied',
  QUOTA_EXCEEDED: 'Storage quota exceeded',
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  save: 'Ctrl+S',
  export: 'Ctrl+E',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  play: 'Space',
  cut: 'Ctrl+X',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  delete: 'Delete',
  selectAll: 'Ctrl+A',
} as const;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  projectName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  },
  fileName: {
    minLength: 1,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_.]+$/,
  },
  duration: {
    min: 0.1, // 100ms
    max: 3600, // 1 hour
  },
  resolution: {
    minWidth: 240,
    maxWidth: 7680, // 8K
    minHeight: 135,
    maxHeight: 4320, // 8K
  },
} as const;
