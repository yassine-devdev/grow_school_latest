'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  subjects: string[];
}

interface LearningGuideProps {
  studentId: string;
}

export function LearningGuide({ studentId }: LearningGuideProps) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock learning paths data
  const mockPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Mathematics Fundamentals',
      description: 'Master the core concepts of algebra, geometry, and basic calculus',
      progress: 65,
      difficulty: 'Intermediate',
      estimatedTime: '8 weeks',
      subjects: ['Algebra', 'Geometry', 'Statistics']
    },
    {
      id: '2',
      title: 'Science Exploration',
      description: 'Discover the wonders of physics, chemistry, and biology',
      progress: 30,
      difficulty: 'Beginner',
      estimatedTime: '12 weeks',
      subjects: ['Physics', 'Chemistry', 'Biology']
    },
    {
      id: '3',
      title: 'Language Arts Mastery',
      description: 'Enhance reading comprehension, writing skills, and literature analysis',
      progress: 80,
      difficulty: 'Advanced',
      estimatedTime: '10 weeks',
      subjects: ['Reading', 'Writing', 'Literature']
    },
    {
      id: '4',
      title: 'Digital Literacy',
      description: 'Learn essential computer skills and digital citizenship',
      progress: 45,
      difficulty: 'Beginner',
      estimatedTime: '6 weeks',
      subjects: ['Computer Skills', 'Digital Safety', 'Programming Basics']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLearningPaths(mockPaths);
      setLoading(false);
    }, 1000);
  }, [studentId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your personalized learning guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md p-6">
      <div className="max-w-7xl mx-auto h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Learning Guide</h1>
          <p className="text-gray-300">Personalized learning paths tailored to your academic goals and learning style</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Learning Paths List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 h-full">
              <h2 className="text-xl font-semibold text-white mb-4">Your Learning Paths</h2>
              
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPath?.id === path.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-white">{path.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{path.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Icons.Clock size={16} />
                        {path.estimatedTime}
                      </div>
                      <div className="text-sm text-gray-400">
                        {path.progress}% Complete
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Subjects */}
                    <div className="flex flex-wrap gap-2">
                      {path.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Path Details */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 h-full">
              {selectedPath ? (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Path Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">{selectedPath.title}</h3>
                      <p className="text-gray-300 text-sm">{selectedPath.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-400">{selectedPath.progress}%</div>
                        <div className="text-xs text-gray-400">Progress</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-400">{selectedPath.estimatedTime}</div>
                        <div className="text-xs text-gray-400">Duration</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Subjects Covered</h4>
                      <div className="space-y-2">
                        {selectedPath.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Icons.BookOpen size={16} className="text-gray-400" />
                            <span className="text-gray-300 text-sm">{subject}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <Icons.Play size={16} />
                        Continue Learning
                      </button>
                      <button className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                        <Icons.BarChart size={16} />
                        View Analytics
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Icons.BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">Select a Learning Path</h3>
                    <p className="text-gray-400 text-sm">Choose a learning path to view detailed information and continue your studies</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
