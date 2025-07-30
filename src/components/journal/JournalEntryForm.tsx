'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useJournal, JournalEntry, CreateJournalEntryData, UpdateJournalEntryData } from '../../hooks/useJournal';
import { MoodLevel } from '../../types/base';
import { useToast } from '../../hooks/useToast';
import { FileAttachment } from '../../types/base';

interface JournalEntryFormProps {
  entry?: JournalEntry;
  onSave?: (entry: JournalEntry) => void;
  onCancel?: () => void;
  autoSave?: boolean;
  userId: string;
}

interface MoodOption {
  value: MoodLevel;
  label: string;
  emoji: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: 'very-low', label: 'Very Low', emoji: '😢', color: 'text-red-500' },
  { value: 'low', label: 'Low', emoji: '😔', color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', emoji: '😐', color: 'text-yellow-500' },
  { value: 'high', label: 'High', emoji: '😊', color: 'text-green-500' },
  { value: 'very-high', label: 'Very High', emoji: '😄', color: 'text-blue-500' },
];

export default function JournalEntryForm({ 
  entry, 
  onSave, 
  onCancel, 
  autoSave = false,
  userId 
}: JournalEntryFormProps) {
  const { createEntry, updateEntry, isCreating, isUpdating } = useJournal({ userId });
  const toast = useToast();
  
  // Form state
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<MoodLevel | undefined>(entry?.mood);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [isPrivate, setIsPrivate] = useState(entry?.isPrivate ?? true);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Auto-save state
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  
  // Rich text editor ref
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const isEditing = !!entry;
  const isLoading = isCreating || isUpdating;
  
  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length > 10000) {
      newErrors.content = 'Content must be less than 10,000 characters';
    }
    
    if (tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content, tags]);
  
  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!autoSave || !hasUnsavedChanges || !validateForm()) return;
    
    const currentData = JSON.stringify({ title, content, mood, tags, isPrivate });
    if (currentData === lastSavedRef.current) return;
    
    try {
      const entryData: CreateJournalEntryData | UpdateJournalEntryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        isPrivate,
        ...(isEditing && { id: entry!.id })
      };
      
      if (isEditing) {
        await updateEntry(entryData as UpdateJournalEntryData);
      } else {
        await createEntry(entryData as CreateJournalEntryData);
      }
      
      lastSavedRef.current = currentData;
      setHasUnsavedChanges(false);
      
      toast({
        type: 'success',
        title: 'Auto-saved',
        description: 'Your changes have been automatically saved.',
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [autoSave, hasUnsavedChanges, validateForm, title, content, mood, tags, isPrivate, isEditing, entry, updateEntry, createEntry, toast]);
  
  // Set up auto-save timer
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(performAutoSave, 3000); // Auto-save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, hasUnsavedChanges, performAutoSave]);
  
  // Track changes
  useEffect(() => {
    const currentData = JSON.stringify({ title, content, mood, tags, isPrivate });
    const originalData = JSON.stringify({
      title: entry?.title || '',
      content: entry?.content || '',
      mood: entry?.mood,
      tags: entry?.tags || [],
      isPrivate: entry?.isPrivate ?? true
    });
    
    setHasUnsavedChanges(currentData !== originalData);
  }, [title, content, mood, tags, isPrivate, entry]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
      });
      return;
    }
    
    try {
      const entryData: CreateJournalEntryData | UpdateJournalEntryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        isPrivate,
        ...(isEditing && { id: entry!.id })
      };
      
      let savedEntry: JournalEntry;
      
      if (isEditing) {
        savedEntry = await updateEntry(entryData as UpdateJournalEntryData);
      } else {
        savedEntry = await createEntry(entryData as CreateJournalEntryData);
      }
      
      setHasUnsavedChanges(false);
      onSave?.(savedEntry);
      
      if (!isEditing) {
        // Reset form for new entries
        setTitle('');
        setContent('');
        setMood(undefined);
        setTags([]);
        setIsPrivate(true);
        setTagInput('');
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };
  
  // Handle tag input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle file attachments
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // TODO: Implement file upload logic
    console.log('Files selected:', files);
  };
  
  // Rich text formatting helpers
  const insertFormatting = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h2>
          {hasUnsavedChanges && (
            <span className="text-sm text-yellow-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Unsaved changes
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
              Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind today?"
              className={`w-full bg-white/5 border-white/20 text-white placeholder-gray-400 ${
                errors.title ? 'border-red-500' : ''
              }`}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">{title.length}/200 characters</p>
          </div>
          
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    mood === option.value
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className={`text-sm ${option.color}`}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Rich Text Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-200">
                Content *
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('bold')}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('italic')}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('bullet')}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white"
                  title="Bullet List"
                >
                  •
                </button>
              </div>
            </div>
            <textarea
              ref={contentRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your thoughts, experiences, or reflections..."
              className={`w-full h-64 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-white/40 ${
                errors.content ? 'border-red-500' : ''
              }`}
              maxLength={10000}
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">{content.length}/10,000 characters</p>
          </div>
          
          {/* Tags Input */}
          <div>
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-200 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-300 hover:text-white ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags (press Enter or comma to add)"
                className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            {errors.tags && (
              <p className="text-red-400 text-sm mt-1">{errors.tags}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">{tags.length}/10 tags</p>
          </div>
          
          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-gray-300 hover:text-white"
              >
                <div className="space-y-2">
                  <div className="text-2xl">📎</div>
                  <p>Click to upload files or drag and drop</p>
                  <p className="text-xs text-gray-400">
                    Images, PDFs, documents up to 10MB each
                  </p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Privacy Setting */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-200">
              Keep this entry private
            </label>
          </div>
          
          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {autoSave && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Auto-save enabled
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  isEditing ? 'Update Entry' : 'Save Entry'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
