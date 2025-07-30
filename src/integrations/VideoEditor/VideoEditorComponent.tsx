/**
 * Video Editor React Component
 * 
 * This component provides a React wrapper around the VideoEditorAdapter,
 * making it easy to integrate the video editor into any React application.
 */

'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { VideoEditorAdapter } from './VideoEditorAdapter';
import type {
  VideoEditorConfig,
  VideoExportData,
  VideoProject,
  VideoAsset,
  VideoEditorError,
  VideoEditorState,
  VIDEO_EDITOR_DEFAULTS
} from './types';

interface VideoEditorProps extends Partial<VideoEditorConfig> {
  /** Additional CSS classes */
  className?: string;
  
  /** Custom styles */
  style?: React.CSSProperties;
  
  /** Loading component */
  loadingComponent?: React.ReactNode;
  
  /** Error component */
  errorComponent?: (error: VideoEditorError) => React.ReactNode;
  
  /** Initial project to load */
  initialProject?: VideoProject;
  
  /** Assets to preload */
  initialAssets?: VideoAsset[];
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  width = VIDEO_EDITOR_DEFAULTS.width,
  height = VIDEO_EDITOR_DEFAULTS.height,
  theme = VIDEO_EDITOR_DEFAULTS.theme,
  features = VIDEO_EDITOR_DEFAULTS.features,
  performance = VIDEO_EDITOR_DEFAULTS.performance,
  onSave,
  onError,
  onLoad,
  onProjectChange,
  className = '',
  style,
  loadingComponent,
  errorComponent,
  initialProject,
  initialAssets,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<VideoEditorAdapter | null>(null);
  
  const [state, setState] = useState<VideoEditorState>({
    isLoading: true,
    isExporting: false,
    hasUnsavedChanges: false,
  });

  // Handle save callback
  const handleSave = useCallback(async (data: VideoExportData) => {
    try {
      await onSave?.(data);
    } catch (error) {
      console.error('Save callback error:', error);
      onError?.({
        code: 'SAVE_CALLBACK_ERROR',
        message: 'Error in save callback',
        details: error,
        timestamp: new Date(),
      });
    }
  }, [onSave, onError]);

  // Handle error callback
  const handleError = useCallback((error: VideoEditorError) => {
    setState(prev => ({ ...prev, error }));
    onError?.(error);
  }, [onError]);

  // Handle load callback
  const handleLoad = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
    onLoad?.();
  }, [onLoad]);

  // Handle project change callback
  const handleProjectChange = useCallback((hasChanges: boolean) => {
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
    onProjectChange?.(hasChanges);
  }, [onProjectChange]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const config: VideoEditorConfig = {
      width,
      height,
      theme,
      features,
      performance,
      onSave: handleSave,
      onError: handleError,
      onLoad: handleLoad,
      onProjectChange: handleProjectChange,
    };

    const adapter = new VideoEditorAdapter(config);
    adapterRef.current = adapter;

    // Subscribe to state changes
    const updateState = () => {
      setState(adapter.getState());
    };

    adapter.on('EDITOR_LOADED', updateState);
    adapter.on('PROJECT_LOADED', updateState);
    adapter.on('PROJECT_SAVED', updateState);
    adapter.on('EXPORT_STARTED', updateState);
    adapter.on('EXPORT_COMPLETED', updateState);
    adapter.on('ERROR', updateState);

    // Initialize the editor
    adapter.initialize(containerRef.current, config).then(async () => {
      // Load initial project if provided
      if (initialProject) {
        await adapter.loadProject(initialProject);
      }

      // Add initial assets if provided
      if (initialAssets && initialAssets.length > 0) {
        await adapter.addAssets(initialAssets);
      }
    }).catch((error) => {
      console.error('Failed to initialize video editor:', error);
    });

    // Cleanup on unmount
    return () => {
      adapter.destroy();
    };
  }, [
    width,
    height,
    theme,
    features,
    performance,
    handleSave,
    handleError,
    handleLoad,
    handleProjectChange,
    initialProject,
    initialAssets,
  ]);

  // Public methods via ref
  const saveProject = useCallback(async (): Promise<VideoProject | null> => {
    if (!adapterRef.current) return null;
    try {
      return await adapterRef.current.saveProject();
    } catch (error) {
      console.error('Failed to save project:', error);
      return null;
    }
  }, []);

  const exportVideo = useCallback(async (options?: any): Promise<VideoExportData | null> => {
    if (!adapterRef.current) return null;
    try {
      return await adapterRef.current.exportVideo(options);
    } catch (error) {
      console.error('Failed to export video:', error);
      return null;
    }
  }, []);

  const addAssets = useCallback(async (assets: VideoAsset[]): Promise<void> => {
    if (!adapterRef.current) return;
    try {
      await adapterRef.current.addAssets(assets);
    } catch (error) {
      console.error('Failed to add assets:', error);
    }
  }, []);

  // Expose methods via imperative handle
  React.useImperativeHandle(containerRef, () => ({
    saveProject,
    exportVideo,
    addAssets,
    getState: () => state,
  }));

  // Render loading state
  if (state.isLoading) {
    return (
      <div 
        className={`video-editor-loading ${className}`}
        style={{ width, height, ...style }}
      >
        {loadingComponent || (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading Video Editor...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div 
        className={`video-editor-error ${className}`}
        style={{ width, height, ...style }}
      >
        {errorComponent?.(state.error) || (
          <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-center p-6">
              <div className="text-red-600 dark:text-red-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Video Editor Error
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                {state.error.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Editor
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render editor
  return (
    <div className={`video-editor-container ${className}`} style={style}>
      <div
        ref={containerRef}
        className="video-editor-content w-full h-full rounded-lg overflow-hidden shadow-lg"
        style={{ width, height }}
      />
      
      {/* Export progress overlay */}
      {state.isExporting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Exporting Video...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This may take a few minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unsaved changes indicator */}
      {state.hasUnsavedChanges && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Unsaved Changes
        </div>
      )}
    </div>
  );
};

// Export types for external use
export type { VideoEditorProps };

// Default export
export default VideoEditor;
