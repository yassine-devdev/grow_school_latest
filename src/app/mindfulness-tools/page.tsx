'use client';

import React, { useState } from 'react';
import { Heart, Music, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MindfulnessMeditationTools from '@/components/wellness/MindfulnessMeditationTools';
import StudyPlaylistGenerator from '@/components/wellness/StudyPlaylistGenerator';
import AIStudentLifeMentor from '@/components/wellness/AIStudentLifeMentor';

type ActiveTool = 'overview' | 'mindfulness' | 'playlist' | 'mentor';

export default function MindfulnessToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('overview');

  const tools = [
    {
      id: 'mindfulness' as const,
      title: 'Mindfulness & Meditation',
      description: 'Guided meditations, breathing exercises, and stress reduction activities',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Guided meditation library',
        'Breathing exercise tools',
        'Stress reduction activities',
        'Progress tracking',
        'Personalized recommendations'
      ]
    },
    {
      id: 'playlist' as const,
      title: 'Study Playlist Generator',
      description: 'AI-powered music recommendations for optimal focus and productivity',
      icon: <Music className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      features: [
        'Personalized music recommendations',
        'Focus-enhancing audio selection',
        'Study session integration',
        'Mood-based playlists',
        'Usage analytics'
      ]
    },
    {
      id: 'mentor' as const,
      title: 'AI Student Life Mentor',
      description: 'AI chatbot for academic and personal guidance with crisis detection',
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      features: [
        'Academic and personal advice',
        'Crisis detection and response',
        'Resource recommendations',
        'Conversation history',
        'Privacy-focused support'
      ]
    }
  ];

  if (activeTool !== 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setActiveTool('overview')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {tools.find(t => t.id === activeTool)?.title}
            </h1>
          </div>
        </div>
        
        <div className="p-6">
          {activeTool === 'mindfulness' && <MindfulnessMeditationTools />}
          {activeTool === 'playlist' && <StudyPlaylistGenerator />}
          {activeTool === 'mentor' && <AIStudentLifeMentor />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Mindfulness & Wellness Tools
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for stress reduction, focus enhancement, and personal growth. 
              Support your mental wellness journey with AI-powered guidance and personalized experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-32 bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                <div className="text-white">
                  {tool.icon}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {tool.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-medium text-gray-700">Key Features:</h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button
                  onClick={() => setActiveTool(tool.id)}
                  className="w-full"
                >
                  Open {tool.title}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Benefits of Mindfulness & Wellness Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Research-backed benefits of incorporating mindfulness and wellness practices into your daily routine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Reduced Stress',
                description: 'Lower cortisol levels and improved stress management',
                icon: '🧘‍♀️'
              },
              {
                title: 'Better Focus',
                description: 'Enhanced concentration and cognitive performance',
                icon: '🎯'
              },
              {
                title: 'Improved Sleep',
                description: 'Better sleep quality and faster sleep onset',
                icon: '😴'
              },
              {
                title: 'Emotional Balance',
                description: 'Greater emotional regulation and resilience',
                icon: '⚖️'
              }
            ].map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Getting Started
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              New to mindfulness? Start with short 5-minute sessions and gradually increase duration. 
              Consistency is more important than length.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">1. Start Small</div>
                <p className="text-sm text-gray-600">
                  Begin with 5-minute breathing exercises or short guided meditations
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">2. Be Consistent</div>
                <p className="text-sm text-gray-600">
                  Practice daily, even if just for a few minutes. Set reminders if needed
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">3. Track Progress</div>
                <p className="text-sm text-gray-600">
                  Use the progress tracking to see your improvements over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}