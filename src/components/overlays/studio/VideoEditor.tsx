/**
 * Video Editor Studio Component
 *
 * This component integrates the professional video editor into the Studio overlay.
 * It uses the clean abstraction layer we created to provide a seamless experience.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { VideoEditor } from '@/integrations/VideoEditor';
import type {
  VideoExportData,
  VideoEditorError
} from '@/integrations/VideoEditor';

const VideoEditorStudio: React.FC = () => {
  const [lastExport, setLastExport] = useState<VideoExportData | null>(null);
  const [error, setError] = useState<VideoEditorError | null>(null);

  // Handle successful video export
  const handleSave = useCallback(async (data: VideoExportData) => {
    try {
      console.log('Video exported successfully:', data);
      setLastExport(data);

      // Here you could:
      // - Save to your backend
      // - Upload to cloud storage
      // - Add to user's project library
      // - Show success notification

      // For now, we'll just create a download link
      const url = URL.createObjectURL(data.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to handle video export:', error);
      setError({
        code: 'EXPORT_HANDLER_ERROR',
        message: 'Failed to process exported video',
        details: error,
        timestamp: new Date(),
      });
    }
  }, []);

  // Handle editor errors
  const handleError = useCallback((error: VideoEditorError) => {
    console.error('Video editor error:', error);
    setError(error);
  }, []);

  // Handle editor load
  const handleLoad = useCallback(() => {
    console.log('Video editor loaded successfully');
    setError(null);
  }, []);

  // Handle project changes
  const handleProjectChange = useCallback((hasChanges: boolean) => {
    console.log('Project has unsaved changes:', hasChanges);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="video-editor-studio h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Video Editor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Professional video editing powered by Remotion
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-4">
          {lastExport && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✓ Last export: {lastExport.name}
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-red-600 dark:text-red-400">
                ⚠ Error: {error.message}
              </div>
              <button
                onClick={clearError}
                className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Editor */}
      <div className="flex-1 p-4">
        <VideoEditor
          width={1280}
          height={720}
          theme="dark"
          features={{
            enableAI: process.env.NODE_ENV === 'development',
            enableExport: true,
            enableImport: true,
            enableCollaboration: false,
          }}
          performance={{
            maxFileSize: 100 * 1024 * 1024, // 100MB
            maxDuration: 600, // 10 minutes
            previewQuality: 'medium',
          }}
          onSave={handleSave}
          onError={handleError}
          onLoad={handleLoad}
          onProjectChange={handleProjectChange}
          className="w-full h-full"
          loadingComponent={
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Loading Video Editor
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Initializing professional video editing tools...
                </p>
              </div>
            </div>
          }
          errorComponent={(error) => (
            <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-center p-8">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                  Video Editor Error
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4 max-w-md">
                  {error.message}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reload Editor
                  </button>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Error Code: {error.code}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default VideoEditorStudio;
