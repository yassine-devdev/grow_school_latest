'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { 
  useMoodTracking, 
  MoodFocusEntry, 
  CreateMoodEntryData,
  TrendDataPoint
} from '../../hooks/useMoodTracking';
import { MoodLevel, FocusLevel, EnergyLevel, StressLevel } from '../../types/base';
import { useToast } from '../../hooks/useToast';

interface MoodFocusCheckInProps {
  userId: string;
  onCheckInComplete?: (checkIn: MoodFocusEntry) => void;
  showTrends?: boolean;
  compact?: boolean;
}

interface LevelOption {
  value: MoodLevel | FocusLevel | EnergyLevel | StressLevel;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

const moodOptions: LevelOption[] = [
  { value: 'very-low', label: 'Very Low', emoji: '😢', color: 'text-red-500', description: 'Feeling very down or sad' },
  { value: 'low', label: 'Low', emoji: '😔', color: 'text-orange-500', description: 'Feeling somewhat down' },
  { value: 'medium', label: 'Medium', emoji: '😐', color: 'text-yellow-500', description: 'Feeling neutral or okay' },
  { value: 'high', label: 'High', emoji: '😊', color: 'text-green-500', description: 'Feeling good or happy' },
  { value: 'very-high', label: 'Very High', emoji: '😄', color: 'text-blue-500', description: 'Feeling excellent or joyful' },
];

const focusOptions: LevelOption[] = [
  { value: 'very-low', label: 'Very Low', emoji: '🌫️', color: 'text-red-500', description: 'Very distracted, hard to concentrate' },
  { value: 'low', label: 'Low', emoji: '😵‍💫', color: 'text-orange-500', description: 'Somewhat distracted' },
  { value: 'medium', label: 'Medium', emoji: '🤔', color: 'text-yellow-500', description: 'Average concentration' },
  { value: 'high', label: 'High', emoji: '🎯', color: 'text-green-500', description: 'Good focus and concentration' },
  { value: 'very-high', label: 'Very High', emoji: '🔥', color: 'text-blue-500', description: 'Laser-focused and sharp' },
];

const energyOptions: LevelOption[] = [
  { value: 'very-low', label: 'Very Low', emoji: '😴', color: 'text-red-500', description: 'Exhausted, no energy' },
  { value: 'low', label: 'Low', emoji: '😪', color: 'text-orange-500', description: 'Tired, low energy' },
  { value: 'medium', label: 'Medium', emoji: '😌', color: 'text-yellow-500', description: 'Moderate energy levels' },
  { value: 'high', label: 'High', emoji: '😃', color: 'text-green-500', description: 'Energetic and active' },
  { value: 'very-high', label: 'Very High', emoji: '⚡', color: 'text-blue-500', description: 'Full of energy and vitality' },
];

const stressOptions: LevelOption[] = [
  { value: 'very-low', label: 'Very Low', emoji: '😌', color: 'text-blue-500', description: 'Very relaxed and calm' },
  { value: 'low', label: 'Low', emoji: '🙂', color: 'text-green-500', description: 'Mostly relaxed' },
  { value: 'medium', label: 'Medium', emoji: '😐', color: 'text-yellow-500', description: 'Some stress, manageable' },
  { value: 'high', label: 'High', emoji: '😰', color: 'text-orange-500', description: 'Quite stressed' },
  { value: 'very-high', label: 'Very High', emoji: '😫', color: 'text-red-500', description: 'Very stressed or overwhelmed' },
];

type CheckInMode = 'quick' | 'detailed';

export default function MoodFocusCheckIn({ 
  userId, 
  onCheckInComplete, 
  showTrends = true, 
  compact = false 
}: MoodFocusCheckInProps) {
  const {
    entries,
    analytics,
    recommendations,
    isLoading,
    isCreating,
    error,
    createEntry,
    getChartData,
    refreshEntries,
    refreshAnalytics
  } = useMoodTracking({ userId });
  
  const toast = useToast();
  
  // Component state
  const [mode, setMode] = useState<CheckInMode>('quick');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [focus, setFocus] = useState<FocusLevel | null>(null);
  const [energy, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [stress, setStress] = useState<StressLevel | null>(null);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');
  
  // Detailed mode fields
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [exerciseMinutes, setExerciseMinutes] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [screenTime, setScreenTime] = useState<number | null>(null);
  const [socialInteraction, setSocialInteraction] = useState<number | null>(null);
  const [productivity, setProductivity] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [challengeInput, setChallengeInput] = useState('');
  
  // Check if user has already checked in today
  const todayEntry = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(entry => entry.created.startsWith(today));
  }, [entries]);
  
  // Get trend data for visualization
  const moodTrend = useMemo(() => getChartData('mood', 7), [getChartData]);
  const focusTrend = useMemo(() => getChartData('focus', 7), [getChartData]);
  const energyTrend = useMemo(() => getChartData('energy', 7), [getChartData]);
  const stressTrend = useMemo(() => getChartData('stress', 7), [getChartData]);
  
  // Reset form
  const resetForm = () => {
    setMood(null);
    setFocus(null);
    setEnergyLevel(null);
    setStress(null);
    setNotes('');
    setTags([]);
    setTagInput('');
    setActivities([]);
    setActivityInput('');
    setSleepHours(null);
    setExerciseMinutes(null);
    setWaterIntake(null);
    setScreenTime(null);
    setSocialInteraction(null);
    setProductivity(null);
    setGratitude([]);
    setGratitudeInput('');
    setChallenges([]);
    setChallengeInput('');
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!mood || !focus || !energy || !stress) {
      toast({
        type: 'warning',
        title: 'Incomplete Check-in',
        description: 'Please rate your mood, focus, energy, and stress levels.',
      });
      return;
    }
    
    try {
      const checkInData: CreateMoodEntryData = {
        mood,
        focus,
        energy,
        stress,
        notes: notes.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        activities: activities.length > 0 ? activities : undefined,
        ...(mode === 'detailed' && {
          sleepHours: sleepHours || undefined,
          exerciseMinutes: exerciseMinutes || undefined,
          waterIntake: waterIntake || undefined,
          screenTime: screenTime || undefined,
          socialInteraction: socialInteraction || undefined,
          productivity: productivity || undefined,
          gratitude: gratitude.length > 0 ? gratitude : undefined,
          challenges: challenges.length > 0 ? challenges : undefined,
        })
      };
      
      const entry = await createEntry(checkInData);
      onCheckInComplete?.(entry);
      resetForm();
      refreshEntries();
      refreshAnalytics();
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };
  
  // Handle tag/activity/gratitude/challenge input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag) && tags.length < 5) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const addActivity = () => {
    const newActivity = activityInput.trim();
    if (newActivity && !activities.includes(newActivity) && activities.length < 5) {
      setActivities([...activities, newActivity]);
      setActivityInput('');
    }
  };
  
  const addGratitude = () => {
    const newGratitude = gratitudeInput.trim();
    if (newGratitude && !gratitude.includes(newGratitude) && gratitude.length < 3) {
      setGratitude([...gratitude, newGratitude]);
      setGratitudeInput('');
    }
  };
  
  const addChallenge = () => {
    const newChallenge = challengeInput.trim();
    if (newChallenge && !challenges.includes(newChallenge) && challenges.length < 3) {
      setChallenges([...challenges, newChallenge]);
      setChallengeInput('');
    }
  };
  
  // Render level selector
  const renderLevelSelector = (
    title: string,
    options: LevelOption[],
    value: string | null,
    onChange: (value: any) => void,
    description?: string
  ) => (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-gray-200">{title}</h4>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              value === option.value
                ? 'bg-white/20 border-white/40 text-white'
                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs text-gray-400 text-center">
          {options.find(opt => opt.value === value)?.description}
        </p>
      )}
    </div>
  );
  
  // Render mini chart
  const renderMiniChart = (data: TrendDataPoint[], title: string, color: string) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return (
      <div className="bg-white/5 rounded-lg p-3">
        <h5 className="text-xs font-medium text-gray-300 mb-2">{title} (7 days)</h5>
        <div className="flex items-end gap-1 h-12">
          {data.map((point, index) => {
            const height = ((point.value - minValue) / range) * 100;
            return (
              <div
                key={index}
                className={`flex-1 ${color} rounded-sm opacity-70`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.date}: ${point.label}`}
              />
            );
          })}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (todayEntry && !compact) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Today's Check-in Complete! ✅</h2>
              <p className="text-gray-300 mt-1">
                You've already checked in today. Come back tomorrow for your next check-in.
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Today's Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">
                {moodOptions.find(opt => opt.value === todayEntry.mood)?.emoji}
              </div>
              <div className="text-sm text-gray-300">Mood</div>
              <div className="text-white font-medium">
                {moodOptions.find(opt => opt.value === todayEntry.mood)?.label}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">
                {focusOptions.find(opt => opt.value === todayEntry.focus)?.emoji}
              </div>
              <div className="text-sm text-gray-300">Focus</div>
              <div className="text-white font-medium">
                {focusOptions.find(opt => opt.value === todayEntry.focus)?.label}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">
                {energyOptions.find(opt => opt.value === todayEntry.energy)?.emoji}
              </div>
              <div className="text-sm text-gray-300">Energy</div>
              <div className="text-white font-medium">
                {energyOptions.find(opt => opt.value === todayEntry.energy)?.label}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">
                {stressOptions.find(opt => opt.value === todayEntry.stress)?.emoji}
              </div>
              <div className="text-sm text-gray-300">Stress</div>
              <div className="text-white font-medium">
                {stressOptions.find(opt => opt.value === todayEntry.stress)?.label}
              </div>
            </div>
          </div>
          
          {/* Trends */}
          {showTrends && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderMiniChart(moodTrend, 'Mood', 'bg-blue-500')}
              {renderMiniChart(focusTrend, 'Focus', 'bg-green-500')}
              {renderMiniChart(energyTrend, 'Energy', 'bg-yellow-500')}
              {renderMiniChart(stressTrend, 'Stress', 'bg-red-500')}
            </div>
          )}
          
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-3">💡 Recommendations</h4>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <p key={index} className="text-gray-300 text-sm">• {rec}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Wellness Check-in</h2>
            <p className="text-gray-300 mt-1">
              How are you feeling today? Take a moment to reflect on your current state.
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setMode('quick')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                mode === 'quick'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quick
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                mode === 'detailed'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderLevelSelector(
            '😊 Mood',
            moodOptions,
            mood,
            setMood,
            'How are you feeling emotionally right now?'
          )}
          
          {renderLevelSelector(
            '🎯 Focus',
            focusOptions,
            focus,
            setFocus,
            'How well can you concentrate and focus today?'
          )}
          
          {renderLevelSelector(
            '⚡ Energy',
            energyOptions,
            energy,
            setEnergyLevel,
            'What is your physical energy level like?'
          )}
          
          {renderLevelSelector(
            '😰 Stress',
            stressOptions,
            stress,
            setStress,
            'How stressed or overwhelmed do you feel?'
          )}
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            📝 Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts or observations about how you're feeling today..."
            className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-white/40"
            maxLength={500}
          />
          <p className="text-gray-400 text-xs mt-1">{notes.length}/500 characters</p>
        </div>
        
        {/* Tags and Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              🏷️ Tags
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
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add mood tags..."
                className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-1">{tags.length}/5 tags</p>
          </div>
          
          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              🏃 Activities
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {activities.map((activity) => (
                <span
                  key={activity}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                >
                  {activity}
                  <button
                    type="button"
                    onClick={() => setActivities(activities.filter(a => a !== activity))}
                    className="text-green-300 hover:text-white ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                placeholder="What did you do today?"
                className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                disabled={activities.length >= 5}
              />
              <Button
                type="button"
                onClick={addActivity}
                disabled={!activityInput.trim() || activities.length >= 5}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-1">{activities.length}/5 activities</p>
          </div>
        </div>
        
        {/* Detailed Mode Fields */}
        {mode === 'detailed' && (
          <div className="space-y-6 pt-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white">📊 Detailed Tracking</h3>
            
            {/* Lifestyle Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  😴 Sleep (hours)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={sleepHours || ''}
                  onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  🏃 Exercise (minutes)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="1440"
                  value={exerciseMinutes || ''}
                  onChange={(e) => setExerciseMinutes(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  💧 Water (glasses)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={waterIntake || ''}
                  onChange={(e) => setWaterIntake(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📱 Screen Time (hours)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={screenTime || ''}
                  onChange={(e) => setScreenTime(e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  👥 Social Time (1-5)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={socialInteraction || ''}
                  onChange={(e) => setSocialInteraction(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📈 Productivity (1-5)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={productivity || ''}
                  onChange={(e) => setProductivity(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="3"
                />
              </div>
            </div>
            
            {/* Gratitude and Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gratitude */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  🙏 Gratitude
                </label>
                <div className="space-y-2 mb-2">
                  {gratitude.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/20"
                    >
                      <span className="text-green-300 text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => setGratitude(gratitude.filter((_, i) => i !== index))}
                        className="text-green-300 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={gratitudeInput}
                    onChange={(e) => setGratitudeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGratitude())}
                    placeholder="What are you grateful for?"
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    disabled={gratitude.length >= 3}
                  />
                  <Button
                    type="button"
                    onClick={addGratitude}
                    disabled={!gratitudeInput.trim() || gratitude.length >= 3}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-1">{gratitude.length}/3 items</p>
              </div>
              
              {/* Challenges */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  🎯 Challenges
                </label>
                <div className="space-y-2 mb-2">
                  {challenges.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-orange-500/10 rounded border border-orange-500/20"
                    >
                      <span className="text-orange-300 text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => setChallenges(challenges.filter((_, i) => i !== index))}
                        className="text-orange-300 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChallenge())}
                    placeholder="What challenges did you face?"
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    disabled={challenges.length >= 3}
                  />
                  <Button
                    type="button"
                    onClick={addChallenge}
                    disabled={!challengeInput.trim() || challenges.length >= 3}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-1">{challenges.length}/3 items</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {mode === 'quick' ? 'Quick check-in' : 'Detailed tracking'} • 
          {mood && focus && energy && stress ? ' Ready to submit' : ' Please complete all ratings'}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={isCreating}
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !mood || !focus || !energy || !stress}
            className="min-w-[120px]"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              'Complete Check-in'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
