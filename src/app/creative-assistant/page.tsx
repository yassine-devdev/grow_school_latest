'use client';

import React, { useState } from 'react';
import CreativeToolsDashboard from '../../components/creative/CreativeToolsDashboard';
import CreativeAssistant from '../../components/creative/CreativeAssistant';
import ProjectBrainstorm from '../../components/creative/ProjectBrainstorm';
import CreativeFeedbackSystem from '../../components/creative/CreativeFeedbackSystem';
import CreativePromptsGenerator from '../../components/creative/CreativePromptsGenerator';
import { CreativeProject, CreativeSession, CreativeProjectType } from '../../types';

export default function CreativeAssistantPage() {
  const [currentTool, setCurrentTool] = useState<string>('dashboard');
  const [currentProject, setCurrentProject] = useState<CreativeProject | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackProjectType, setFeedbackProjectType] = useState<CreativeProjectType>('writing');

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user_123';

  const handleToolSelect = (tool: string, data?: any) => {
    setCurrentTool(tool);
    
    if (tool === 'feedback' && data) {
      setFeedbackContent(data.content || '');
      setFeedbackProjectType(data.projectType || 'writing');
    }
  };

  const handleProjectCreate = async (projectData: any) => {
    try {
      const response = await fetch('/api/creative-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...projectData
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setCurrentProject(project);
        setCurrentTool('assistant');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleSessionCreate = (session: CreativeSession) => {
    console.log('Session created:', session);
  };

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'dashboard':
        return (
          <CreativeToolsDashboard
            userId={userId}
            onToolSelect={handleToolSelect}
          />
        );

      case 'assistant':
        return (
          <CreativeAssistant
            userId={userId}
            projectId={currentProject?.id}
            onSessionCreate={handleSessionCreate}
          />
        );

      case 'brainstorm':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTool('dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
            <ProjectBrainstorm
              onProjectCreate={handleProjectCreate}
              onClose={() => setCurrentTool('dashboard')}
            />
          </div>
        );

      case 'feedback':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTool('dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            {feedbackContent ? (
              <CreativeFeedbackSystem
                userId={userId}
                projectType={feedbackProjectType}
                content={feedbackContent}
                onFeedbackReceived={(feedback) => {
                  console.log('Feedback received:', feedback);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Creative Feedback System</h2>
                <p className="text-gray-600 mb-6">
                  Paste your creative content below to get AI-powered feedback and suggestions.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type
                    </label>
                    <select
                      value={feedbackProjectType}
                      onChange={(e) => setFeedbackProjectType(e.target.value as CreativeProjectType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="writing">Writing</option>
                      <option value="design">Design</option>
                      <option value="video">Video</option>
                      <option value="music">Music</option>
                      <option value="art">Art</option>
                      <option value="presentation">Presentation</option>
                      <option value="website">Website</option>
                      <option value="app">App</option>
                      <option value="game">Game</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Content
                    </label>
                    <textarea
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="Paste your creative work here for AI feedback..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={10}
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (feedbackContent.trim()) {
                        // Re-render with content
                        setCurrentTool('feedback');
                      }
                    }}
                    disabled={!feedbackContent.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Get Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'prompts':
        return (
          <div>
            <div className="max-w-6xl mx-auto p-6 mb-6">
              <button
                onClick={() => setCurrentTool('dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
            <CreativePromptsGenerator
              userId={userId}
              onPromptSelect={(prompt) => {
                console.log('Prompt selected:', prompt);
                // Could start a new creative session with this prompt
              }}
              onPromptSave={(prompt) => {
                console.log('Prompt saved:', prompt);
              }}
            />
          </div>
        );

      case 'outline':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTool('dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Outliner</h2>
              <p className="text-gray-600 mb-6">
                Create structured outlines for your creative projects with AI assistance.
              </p>
              
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  This feature is integrated into the Creative Assistant. 
                  Start a new session to create project outlines.
                </p>
                <button
                  onClick={() => setCurrentTool('assistant')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Creative Assistant
                </button>
              </div>
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentTool('dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Creative Analytics</h2>
              <p className="text-gray-600 mb-6">
                View insights about your creative patterns and progress.
              </p>
              
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Insights are available in the dashboard. Create some projects and sessions to see your analytics.
                </p>
                <button
                  onClick={() => setCurrentTool('dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <CreativeToolsDashboard
            userId={userId}
            onToolSelect={handleToolSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentTool()}
    </div>
  );
}