/**
 * Video Editor Integration Types
 * 
 * This file defines the interface between our application and the third-party video editor.
 * It provides a clean abstraction layer that isolates our app from the vendor implementation.
 */

export interface VideoEditorConfig {
  /** Editor dimensions */
  width: number;
  height: number;
  
  /** Theme configuration */
  theme: 'light' | 'dark';
  
  /** Feature flags */
  features?: {
    enableAI?: boolean;
    enableExport?: boolean;
    enableImport?: boolean;
    enableCollaboration?: boolean;
  };
  
  /** Performance settings */
  performance?: {
    maxFileSize?: number; // in bytes
    maxDuration?: number; // in seconds
    previewQuality?: 'low' | 'medium' | 'high';
  };
  
  /** Event handlers */
  onSave?: (data: VideoExportData) => Promise<void>;
  onError?: (error: VideoEditorError) => void;
  onLoad?: () => void;
  onProjectChange?: (hasChanges: boolean) => void;
}

export interface VideoExportData {
  /** Video metadata */
  id: string;
  name: string;
  duration: number; // in seconds
  format: 'mp4' | 'webm' | 'mov';
  resolution: {
    width: number;
    height: number;
  };
  
  /** Export data */
  blob: Blob;
  url?: string;
  size: number; // in bytes
  
  /** Project data for re-editing */
  projectData?: any;
  
  /** Timestamps */
  createdAt: Date;
  exportedAt: Date;
}

export interface VideoEditorError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface VideoProject {
  id: string;
  name: string;
  data: any; // Vendor-specific project data
  thumbnail?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoAsset {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  url: string;
  name: string;
  duration?: number;
  size: number;
}

/**
 * Main Video Editor Interface
 * This is the contract that any video editor implementation must follow
 */
export interface IVideoEditor {
  /** Initialize the editor */
  initialize(container: HTMLElement, config: VideoEditorConfig): Promise<void>;
  
  /** Load a project */
  loadProject(project: VideoProject): Promise<void>;
  
  /** Save current project */
  saveProject(): Promise<VideoProject>;
  
  /** Export video */
  exportVideo(options?: ExportOptions): Promise<VideoExportData>;
  
  /** Add assets to the editor */
  addAssets(assets: VideoAsset[]): Promise<void>;
  
  /** Get current project state */
  getProjectState(): any;
  
  /** Cleanup and destroy editor */
  destroy(): Promise<void>;
}

export interface ExportOptions {
  format?: 'mp4' | 'webm' | 'mov';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
  bitrate?: number;
}

/**
 * Editor State Management
 */
export interface VideoEditorState {
  isLoading: boolean;
  isExporting: boolean;
  hasUnsavedChanges: boolean;
  currentProject?: VideoProject;
  error?: VideoEditorError;
  exportProgress?: number; // 0-100
}

/**
 * Integration Events
 */
export type VideoEditorEvent = 
  | { type: 'EDITOR_LOADED' }
  | { type: 'PROJECT_LOADED'; project: VideoProject }
  | { type: 'PROJECT_SAVED'; project: VideoProject }
  | { type: 'EXPORT_STARTED' }
  | { type: 'EXPORT_PROGRESS'; progress: number }
  | { type: 'EXPORT_COMPLETED'; data: VideoExportData }
  | { type: 'ERROR'; error: VideoEditorError }
  | { type: 'ASSETS_ADDED'; assets: VideoAsset[] };

/**
 * Configuration Constants
 */
export const VIDEO_EDITOR_DEFAULTS = {
  width: 1280,
  height: 720,
  theme: 'dark' as const,
  features: {
    enableAI: false,
    enableExport: true,
    enableImport: true,
    enableCollaboration: false,
  },
  performance: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 600, // 10 minutes
    previewQuality: 'medium' as const,
  },
} as const;

export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'mov'] as const;
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac'] as const;
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;
