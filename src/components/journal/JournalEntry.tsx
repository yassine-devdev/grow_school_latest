'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { JournalEntry as JournalEntryType } from '../../hooks/useJournal';
import { MoodLevel } from '../../types/base';
import { useToast } from '../../hooks/useToast';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit?: (entry: JournalEntryType) => void;
  onDelete?: (id: string) => void;
  onShare?: (entry: JournalEntryType) => void;
  compact?: boolean;
  showAnalytics?: boolean;
}

interface EntryAnalytics {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  sentimentScore?: number;
  keyTopics?: string[];
  writingComplexity?: 'simple' | 'moderate' | 'complex';
  emotionalTone?: string[];
}

interface MoodConfig {
  emoji: string;
  color: string;
  label: string;
  bgColor: string;
}

const moodConfigs: Record<MoodLevel, MoodConfig> = {
  'very-low': { emoji: '😢', color: 'text-red-400', label: 'Very Low', bgColor: 'bg-red-500/10' },
  'low': { emoji: '😔', color: 'text-orange-400', label: 'Low', bgColor: 'bg-orange-500/10' },
  'medium': { emoji: '😐', color: 'text-yellow-400', label: 'Medium', bgColor: 'bg-yellow-500/10' },
  'high': { emoji: '😊', color: 'text-green-400', label: 'High', bgColor: 'bg-green-500/10' },
  'very-high': { emoji: '😄', color: 'text-blue-400', label: 'Very High', bgColor: 'bg-blue-500/10' },
};

export default function JournalEntry({ 
  entry, 
  onEdit, 
  onDelete, 
  onShare, 
  compact = false,
  showAnalytics = false 
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  
  const moodConfig = entry.mood ? moodConfigs[entry.mood] : null;
  
  // Format date
  const formattedDate = useMemo(() => {
    const date = new Date(entry.created);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, [entry.created]);
  
  // Format content with basic markdown-like rendering
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Simple formatting for bold, italic, and bullet points
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n/g, '<br />');
  };
  
  // Truncate content for compact view
  const displayContent = useMemo(() => {
    if (isExpanded) {
      return formatContent(entry.content);
    }
    
    const maxLength = compact ? 150 : 300;
    if (entry.content.length <= maxLength) {
      return formatContent(entry.content);
    }
    
    return formatContent(entry.content.substring(0, maxLength) + '...');
  }, [entry.content, isExpanded, compact]);
  
  // Calculate comprehensive analytics
  const entryAnalytics = useMemo((): EntryAnalytics => {
    const wordsPerMinute = 200;
    const wordCount = entry.content.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = entry.content.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    
    // Simple sentiment analysis based on mood
    const sentimentScore = entry.mood ? {
      'very-low': 0.1,
      'low': 0.3,
      'medium': 0.5,
      'high': 0.7,
      'very-high': 0.9
    }[entry.mood] : undefined;
    
    // Extract key topics from content (simple keyword extraction)
    const keyTopics = entry.content
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 4)
      .reduce((acc: Record<string, number>, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    
    const topTopics = Object.entries(keyTopics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
    
    // Determine writing complexity based on sentence length and vocabulary
    const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    const writingComplexity: 'simple' | 'moderate' | 'complex' = 
      avgSentenceLength < 10 ? 'simple' : 
      avgSentenceLength < 20 ? 'moderate' : 'complex';
    
    // Detect emotional tone keywords
    const emotionalKeywords = {
      joy: ['happy', 'excited', 'joy', 'wonderful', 'amazing', 'great', 'fantastic'],
      sadness: ['sad', 'depressed', 'down', 'upset', 'disappointed', 'hurt'],
      anxiety: ['worried', 'anxious', 'nervous', 'stressed', 'overwhelmed', 'panic'],
      anger: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious'],
      gratitude: ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky'],
      hope: ['hope', 'optimistic', 'positive', 'confident', 'determined']
    };
    
    const emotionalTone = Object.entries(emotionalKeywords)
      .filter(([, keywords]) => 
        keywords.some(keyword => entry.content.toLowerCase().includes(keyword))
      )
      .map(([emotion]) => emotion);
    
    return {
      wordCount,
      characterCount,
      readingTime,
      sentimentScore,
      keyTopics: topTopics,
      writingComplexity,
      emotionalTone
    };
  }, [entry.content, entry.mood]);
  
  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete?.(entry.id);
      toast({
        type: 'success',
        title: 'Entry Deleted',
        description: 'Your journal entry has been deleted successfully.',
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete the journal entry. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (entry.isPrivate) {
      toast({
        type: 'warning',
        title: 'Private Entry',
        description: 'This entry is marked as private and cannot be shared.',
      });
      return;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: entry.title,
          text: entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : ''),
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${entry.title}\n\n${entry.content}`);
        toast({
          type: 'success',
          title: 'Copied to Clipboard',
          description: 'Entry content has been copied to your clipboard.',
        });
      }
      
      onShare?.(entry);
    } catch (shareError) {
      console.error('Share failed:', shareError);
      toast({
        type: 'error',
        title: 'Share Failed',
        description: 'Failed to share the entry. Please try again.',
      });
    }
  };
  
  return (
    <Card className={`w-full transition-all duration-200 hover:bg-white/15 ${compact ? 'mb-4' : 'mb-6'}`}>
      <CardHeader className={compact ? 'pb-3 px-4 pt-4' : 'pb-4 px-4 md:px-6 pt-4 md:pt-6'}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className={`font-semibold text-white ${compact ? 'text-lg' : 'text-xl'} leading-tight`}>
                {entry.title}
              </h3>
              {entry.isPrivate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-300 whitespace-nowrap">
                  🔒 Private
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-400 flex-wrap">
              <span className="whitespace-nowrap">{formattedDate}</span>
              <span className="whitespace-nowrap">{entryAnalytics.readingTime} min read</span>
              <span className="whitespace-nowrap">{entryAnalytics.wordCount} words</span>
              {entry.updated !== entry.created && (
                <span className="text-yellow-400 whitespace-nowrap">• Edited</span>
              )}
            </div>
          </div>
          
          {moodConfig && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${moodConfig.bgColor} self-start`}>
              <span className="text-lg">{moodConfig.emoji}</span>
              {!compact && (
                <span className={`text-sm ${moodConfig.color} whitespace-nowrap`}>
                  {moodConfig.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'py-3 px-4' : 'py-4 px-4 md:px-6'}>
        <div 
          className="text-gray-200 leading-relaxed prose prose-invert max-w-none prose-sm sm:prose-base"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
        
        {entry.content.length > (compact ? 150 : 300) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Enhanced Analytics (if enabled) */}
        {showAnalytics && isExpanded && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
              📊 Entry Insights
            </h4>
            
            {/* Basic Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400 block">Word Count</span>
                <p className="text-white font-medium text-sm">{entryAnalytics.wordCount}</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400 block">Characters</span>
                <p className="text-white font-medium text-sm">{entryAnalytics.characterCount}</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400 block">Reading Time</span>
                <p className="text-white font-medium text-sm">{entryAnalytics.readingTime} min</p>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-gray-400 block">Tags</span>
                <p className="text-white font-medium text-sm">{entry.tags?.length || 0}</p>
              </div>
            </div>
            
            {/* Advanced Analytics */}
            <div className="space-y-3">
              {/* Sentiment Score */}
              {entryAnalytics.sentimentScore !== undefined && (
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Emotional Tone</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${entryAnalytics.sentimentScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white">
                      {entryAnalytics.sentimentScore > 0.7 ? 'Positive' : 
                       entryAnalytics.sentimentScore > 0.3 ? 'Neutral' : 'Reflective'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Key Topics */}
              {entryAnalytics.keyTopics && entryAnalytics.keyTopics.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Key Topics</span>
                  <div className="flex flex-wrap gap-1">
                    {entryAnalytics.keyTopics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Emotional Tone */}
              {entryAnalytics.emotionalTone && entryAnalytics.emotionalTone.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Emotional Themes</span>
                  <div className="flex flex-wrap gap-1">
                    {entryAnalytics.emotionalTone.map((emotion, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs capitalize"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Writing Complexity */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Writing Style</span>
                <span className={`px-2 py-1 rounded capitalize ${
                  entryAnalytics.writingComplexity === 'simple' ? 'bg-green-500/20 text-green-300' :
                  entryAnalytics.writingComplexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {entryAnalytics.writingComplexity}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${compact ? 'pt-3 px-4 pb-4' : 'pt-4 px-4 md:px-6 pb-4 md:pb-6'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(entry)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="mr-1">✏️</span>
            <span className="hidden sm:inline">Edit</span>
          </Button>
          
          {!entry.isPrivate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="mr-1">📤</span>
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}
          
          {/* Analytics Toggle */}
          {!compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors sm:hidden"
            >
              <span className="mr-1">📊</span>
              Insights
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-red-400 whitespace-nowrap">Delete this entry?</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="min-w-[60px]"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <span className="mr-1">🗑️</span>
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
