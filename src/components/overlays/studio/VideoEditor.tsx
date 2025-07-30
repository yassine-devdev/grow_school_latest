'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the actual video editor
const ReactVideoEditor = dynamic(
  () => import('./react-video-editor-pro-main/components/editor/version-7.0.0/react-video-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-gray-900">
        <div className="text-white">Loading Video Editor...</div>
      </div>
    )
  }
);

const VideoEditor: React.FC = () => {
  const projectId = React.useMemo(() => `studio-project-${Date.now()}`, []);

  return (
    <div className="w-full h-full bg-gray-900 video-editor-container">
      <ReactVideoEditor projectId={projectId} />
    </div>
  );
};

export default VideoEditor;
