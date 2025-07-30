/**
 * Video Editor Integration - Public API
 * 
 * This is the main entry point for the video editor integration.
 * It exports all the public interfaces, components, and utilities
 * that other parts of the application can use.
 */

// Main components
export { VideoEditor, default as VideoEditorComponent } from './VideoEditorComponent';
export { VideoEditorAdapter } from './VideoEditorAdapter';

// Types and interfaces
export type {
  VideoEditorConfig,
  VideoExportData,
  VideoProject,
  VideoAsset,
  VideoEditorError,
  VideoEditorState,
  VideoEditorEvent,
  IVideoEditor,
  ExportOptions,
  VideoEditorProps,
} from './types';

export {
  VIDEO_EDITOR_DEFAULTS,
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
} from './types';

// Configuration
export {
  DEFAULT_VIDEO_EDITOR_CONFIG,
  VIDEO_EDITOR_ENV_CONFIG,
  getVideoEditorConfig,
  SUPPORTED_FORMATS,
  EXPORT_PRESETS,
  THEME_CONFIG,
  PERFORMANCE_THRESHOLDS,
  FEATURE_FLAGS,
  API_ENDPOINTS,
  ERROR_CODES,
  KEYBOARD_SHORTCUTS,
  VALIDATION_RULES,
} from './config';

// Utility functions
export const VideoEditorUtils = {
  /**
   * Validate file format
   */
  isValidFormat(fileName: string, type: 'video' | 'audio' | 'image'): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return false;
    
    return SUPPORTED_FORMATS[type].input.includes(extension as any);
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Generate unique ID
   */
  generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Validate video editor configuration
   */
  validateConfig(config: Partial<VideoEditorConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.width && (config.width < 240 || config.width > 7680)) {
      errors.push('Width must be between 240 and 7680 pixels');
    }
    
    if (config.height && (config.height < 135 || config.height > 4320)) {
      errors.push('Height must be between 135 and 4320 pixels');
    }
    
    if (config.performance?.maxFileSize && config.performance.maxFileSize < 1024 * 1024) {
      errors.push('Max file size must be at least 1MB');
    }
    
    if (config.performance?.maxDuration && config.performance.maxDuration < 1) {
      errors.push('Max duration must be at least 1 second');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get optimal export preset based on input resolution
   */
  getOptimalExportPreset(inputWidth: number, inputHeight: number): keyof typeof EXPORT_PRESETS {
    const inputPixels = inputWidth * inputHeight;
    
    if (inputPixels <= 640 * 360) return 'low';
    if (inputPixels <= 1280 * 720) return 'medium';
    if (inputPixels <= 1920 * 1080) return 'high';
    return 'ultra';
  },

  /**
   * Check if browser supports video editor features
   */
  checkBrowserSupport(): { isSupported: boolean; missingFeatures: string[] } {
    const missingFeatures: string[] = [];
    
    // Check for required APIs
    if (!window.File) missingFeatures.push('File API');
    if (!window.FileReader) missingFeatures.push('FileReader API');
    if (!window.URL || !window.URL.createObjectURL) missingFeatures.push('URL API');
    if (!window.Worker) missingFeatures.push('Web Workers');
    if (!window.postMessage) missingFeatures.push('PostMessage API');
    
    // Check for media APIs
    if (!window.MediaRecorder) missingFeatures.push('MediaRecorder API');
    if (!document.createElement('video').canPlayType) missingFeatures.push('Video playback');
    
    // Check for modern JavaScript features
    if (!window.Promise) missingFeatures.push('Promises');
    if (!window.fetch) missingFeatures.push('Fetch API');
    
    return {
      isSupported: missingFeatures.length === 0,
      missingFeatures,
    };
  },

  /**
   * Create error object with consistent format
   */
  createError(code: keyof typeof ERROR_CODES, details?: any): VideoEditorError {
    return {
      code,
      message: ERROR_CODES[code],
      details,
      timestamp: new Date(),
    };
  },
};

// Re-export configuration for convenience
export { SUPPORTED_FORMATS, EXPORT_PRESETS, FEATURE_FLAGS, ERROR_CODES } from './config';

// Default export for easy importing
export default {
  VideoEditor,
  VideoEditorAdapter,
  VideoEditorUtils,
  config: {
    DEFAULT_VIDEO_EDITOR_CONFIG,
    getVideoEditorConfig,
    SUPPORTED_FORMATS,
    EXPORT_PRESETS,
    FEATURE_FLAGS,
  },
};
