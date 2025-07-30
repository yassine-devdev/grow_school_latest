'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { 
  useCreativeAssistant, 
  CreativeProject, 
  CreativeSession,
  BrainstormRequest,
  FeedbackRequest,
  OutlineRequest,
  ContentGenerationRequest,
  PromptsRequest
} from '../../hooks/useCreativeAssistant';
import { useToast } from '../../hooks/useToast';

interface CreativeAssistantProps {
  userId: string;
  projectId?: string;
  initialPrompt?: string;
  onSessionCreate?: (session: CreativeSession) => void;
}

type AssistantMode = 'brainstorm' | 'feedback' | 'outline' | 'generate' | 'prompts';
type ProjectType = 'writing' | 'design' | 'video' | 'music' | 'art' | 'presentation' | 'website' | 'app' | 'game' | 'other';

const projectTypeOptions: { value: ProjectType; label: string; emoji: string }[] = [
  { value: 'writing', label: 'Writing', emoji: '✍️' },
  { value: 'design', label: 'Design', emoji: '🎨' },
  { value: 'video', label: 'Video', emoji: '🎬' },
  { value: 'music', label: 'Music', emoji: '🎵' },
  { value: 'art', label: 'Art', emoji: '🖼️' },
  { value: 'presentation', label: 'Presentation', emoji: '📊' },
  { value: 'website', label: 'Website', emoji: '🌐' },
  { value: 'app', label: 'App', emoji: '📱' },
  { value: 'game', label: 'Game', emoji: '🎮' },
  { value: 'other', label: 'Other', emoji: '💡' },
];

const contentStyles = [
  'professional', 'casual', 'creative', 'academic', 'technical', 'persuasive', 'storytelling', 'humorous'
];

export default function CreativeAssistant({ 
  userId, 
  projectId, 
  initialPrompt = '',
  onSessionCreate 
}: CreativeAssistantProps) {
  const {
    sessions,
    projects,
    isLoading,
    isBrainstorming,
    isGeneratingFeedback,
    isGeneratingOutline,
    isGeneratingContent,
    isGeneratingPrompts,
    error,
    brainstorm,
    generateFeedback,
    generateOutline,
    generateContent,
    generatePrompts,
    createProject,
    refreshSessions,
    refreshProjects
  } = useCreativeAssistant({ userId, projectId });
  
  const toast = useToast();
  
  // Component state
  const [mode, setMode] = useState<AssistantMode>('brainstorm');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [projectType, setProjectType] = useState<ProjectType>('writing');
  const [selectedProject, setSelectedProject] = useState<CreativeProject | null>(null);
  const [contentStyle, setContentStyle] = useState('professional');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [result, setResult] = useState<string | string[] | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CreativeSession[]>([]);
  
  // Refs
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Effects
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        setProjectType(project.type);
      }
    }
  }, [projectId, projects]);
  
  useEffect(() => {
    setSessionHistory(sessions.slice(0, 10)); // Show last 10 sessions
  }, [sessions]);
  
  // Scroll to result when it updates
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);
  
  // Handle AI operations
  const handleBrainstorm = async () => {
    if (!prompt.trim()) {
      toast({
        type: 'warning',
        title: 'Input Required',
        description: 'Please enter a prompt for brainstorming.',
      });
      return;
    }
    
    try {
      const request: BrainstormRequest = {
        prompt: prompt.trim(),
        projectType,
        projectId: selectedProject?.id
      };
      
      const ideas = await brainstorm(request);
      setResult(ideas);
      refreshSessions();
    } catch (error) {
      console.error('Brainstorm failed:', error);
    }
  };
  
  const handleFeedback = async () => {
    if (!prompt.trim()) {
      toast({
        type: 'warning',
        title: 'Content Required',
        description: 'Please enter content to get feedback on.',
      });
      return;
    }
    
    try {
      const request: FeedbackRequest = {
        content: prompt.trim(),
        projectType,
        projectId: selectedProject?.id
      };
      
      const feedback = await generateFeedback(request);
      setResult(feedback);
      refreshSessions();
    } catch (error) {
      console.error('Feedback generation failed:', error);
    }
  };
  
  const handleOutline = async () => {
    if (!prompt.trim()) {
      toast({
        type: 'warning',
        title: 'Title Required',
        description: 'Please enter a title for the outline.',
      });
      return;
    }
    
    try {
      const request: OutlineRequest = {
        title: prompt.trim(),
        projectType,
        description: `Generate an outline for: ${prompt.trim()}`,
        projectId: selectedProject?.id
      };
      
      const outline = await generateOutline(request);
      setResult(outline);
      refreshSessions();
    } catch (error) {
      console.error('Outline generation failed:', error);
    }
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        type: 'warning',
        title: 'Prompt Required',
        description: 'Please enter a prompt for content generation.',
      });
      return;
    }
    
    try {
      const request: ContentGenerationRequest = {
        prompt: prompt.trim(),
        projectType,
        style: contentStyle,
        projectId: selectedProject?.id
      };
      
      const content = await generateContent(request);
      setResult(content);
      refreshSessions();
    } catch (error) {
      console.error('Content generation failed:', error);
    }
  };
  
  const handlePrompts = async () => {
    try {
      const request: PromptsRequest = {
        category: projectType,
        difficulty: 'intermediate'
      };
      
      const prompts = await generatePrompts(request);
      setResult(prompts);
    } catch (error) {
      console.error('Prompts generation failed:', error);
    }
  };
  
  // Handle project creation
  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      toast({
        type: 'warning',
        title: 'Title Required',
        description: 'Please enter a project title.',
      });
      return;
    }
    
    try {
      const project = await createProject({
        title: newProjectTitle.trim(),
        description: newProjectDescription.trim(),
        type: projectType,
        status: 'planning',
        userId
      });
      
      setSelectedProject(project);
      setShowProjectForm(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      refreshProjects();
    } catch (error) {
      console.error('Project creation failed:', error);
    }
  };
  
  // Handle mode-specific action
  const handleAction = () => {
    switch (mode) {
      case 'brainstorm':
        return handleBrainstorm();
      case 'feedback':
        return handleFeedback();
      case 'outline':
        return handleOutline();
      case 'generate':
        return handleGenerate();
      case 'prompts':
        return handlePrompts();
    }
  };
  
  // Get loading state for current mode
  const isCurrentModeLoading = () => {
    switch (mode) {
      case 'brainstorm':
        return isBrainstorming;
      case 'feedback':
        return isGeneratingFeedback;
      case 'outline':
        return isGeneratingOutline;
      case 'generate':
        return isGeneratingContent;
      case 'prompts':
        return isGeneratingPrompts;
      default:
        return false;
    }
  };
  
  // Get mode-specific placeholder and button text
  const getModeConfig = () => {
    switch (mode) {
      case 'brainstorm':
        return {
          placeholder: 'Describe your project or idea to brainstorm...',
          buttonText: 'Generate Ideas',
          description: 'Get creative ideas and suggestions for your project'
        };
      case 'feedback':
        return {
          placeholder: 'Paste your content here to get feedback...',
          buttonText: 'Get Feedback',
          description: 'Receive constructive feedback on your work'
        };
      case 'outline':
        return {
          placeholder: 'Enter your project title or topic...',
          buttonText: 'Create Outline',
          description: 'Generate a structured outline for your project'
        };
      case 'generate':
        return {
          placeholder: 'Describe what you want to create...',
          buttonText: 'Generate Content',
          description: 'Create content based on your specifications'
        };
      case 'prompts':
        return {
          placeholder: 'Click to generate creative prompts...',
          buttonText: 'Get Prompts',
          description: 'Get inspiring prompts for your creative work'
        };
    }
  };
  
  const modeConfig = getModeConfig();
  const currentlyLoading = isCurrentModeLoading();
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🤖 Creative Assistant
              </h2>
              <p className="text-gray-300 mt-1">
                AI-powered creative companion for brainstorming, feedback, and content generation
              </p>
            </div>
            
            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setSelectedProject(project || null);
                  if (project) setProjectType(project.type);
                }}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectForm(true)}
              >
                + New Project
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Mode Selection */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {[
              { mode: 'brainstorm', label: 'Brainstorm', emoji: '💡' },
              { mode: 'feedback', label: 'Feedback', emoji: '📝' },
              { mode: 'outline', label: 'Outline', emoji: '📋' },
              { mode: 'generate', label: 'Generate', emoji: '✨' },
              { mode: 'prompts', label: 'Prompts', emoji: '🎯' },
            ].map(({ mode: modeValue, label, emoji }) => (
              <button
                key={modeValue}
                onClick={() => setMode(modeValue as AssistantMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  mode === modeValue
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">
                {modeConfig.buttonText}
              </h3>
              <p className="text-gray-400 text-sm">
                {modeConfig.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Project Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Project Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {projectTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setProjectType(option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        projectType === option.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content Style (for generate mode) */}
              {mode === 'generate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Content Style
                  </label>
                  <select
                    value={contentStyle}
                    onChange={(e) => setContentStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white"
                  >
                    {contentStyles.map(style => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Input Area */}
              {mode !== 'prompts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {mode === 'feedback' ? 'Your Content' : 'Your Prompt'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={modeConfig.placeholder}
                    className="w-full h-32 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-white/40"
                    maxLength={2000}
                  />
                  <p className="text-gray-400 text-xs mt-1">{prompt.length}/2000 characters</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button
                onClick={handleAction}
                disabled={currentlyLoading || (mode !== 'prompts' && !prompt.trim())}
                className="w-full"
                size="lg"
              >
                {currentlyLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  modeConfig.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Session History */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No sessions yet. Start creating!
                </p>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map(session => (
                    <div
                      key={session.id}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                          {session.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(session.created).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {session.input.substring(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Results */}
      {result && (
        <Card ref={resultRef}>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Results</h3>
          </CardHeader>
          <CardContent>
            {Array.isArray(result) ? (
              <div className="space-y-3">
                {result.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-200 leading-relaxed">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed font-sans">
                    {result}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(
                  Array.isArray(result) ? result.join('\n\n') : result
                )}
              >
                📋 Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResult(null)}
              >
                ✨ Clear
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Project Creation Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Create New Project</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Project Title
                </label>
                <Input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Enter project title..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project..."
                  className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProjectForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="flex-1"
              >
                Create Project
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
