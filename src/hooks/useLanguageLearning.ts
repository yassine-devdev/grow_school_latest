import { useState, useEffect, useCallback } from 'react';
import {
  LanguageCode,
  Language,
  LanguageChatbot,
  ConversationScenario,
  ChatSession,
  ChatMessage,
  UserLanguageProfile,
  LanguageLearningAnalytics,
  LanguageLearningSettings,
  PracticeExercise,
  SpeechRecognitionResult,
  ChatbotResponse,
  SpeechAnalysisResponse
} from '../types/language-learning';

interface UseLanguageLearningOptions {
  userId: string;
  initialLanguage?: LanguageCode;
}

export function useLanguageLearning({ userId, initialLanguage = 'es' }: UseLanguageLearningOptions) {
  // State
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(initialLanguage);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const [chatbots, setChatbots] = useState<LanguageChatbot[]>([]);
  const [scenarios, setScenarios] = useState<ConversationScenario[]>([]);
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [userProfile, setUserProfile] = useState<UserLanguageProfile | null>(null);
  const [analytics, setAnalytics] = useState<LanguageLearningAnalytics | null>(null);
  const [settings, setSettings] = useState<LanguageLearningSettings | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load supported languages
  const loadSupportedLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/language-learning/languages');
      if (!response.ok) throw new Error('Failed to load languages');
      const languages = await response.json();
      setSupportedLanguages(languages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load languages');
    }
  }, []);

  // Load chatbots for selected language
  const loadChatbots = useCallback(async (language: LanguageCode) => {
    try {
      const response = await fetch(`/api/language-learning/chatbots?language=${language}`);
      if (!response.ok) throw new Error('Failed to load chatbots');
      const chatbotsData = await response.json();
      setChatbots(chatbotsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chatbots');
    }
  }, []);

  // Load conversation scenarios
  const loadScenarios = useCallback(async (language: LanguageCode) => {
    try {
      const response = await fetch(`/api/language-learning/scenarios?language=${language}`);
      if (!response.ok) throw new Error('Failed to load scenarios');
      const scenariosData = await response.json();
      setScenarios(scenariosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    }
  }, []);

  // Load practice exercises
  const loadExercises = useCallback(async (language: LanguageCode, type?: string) => {
    try {
      const params = new URLSearchParams({ language });
      if (type) params.append('type', type);
      
      const response = await fetch(`/api/language-learning/exercises?${params}`);
      if (!response.ok) throw new Error('Failed to load exercises');
      const exercisesData = await response.json();
      setExercises(exercisesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    }
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/language-learning/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to load user profile');
      const profile = await response.json();
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    }
  }, [userId]);

  // Load analytics
  const loadAnalytics = useCallback(async (language: LanguageCode, dateRange?: { startDate: string; endDate: string }) => {
    try {
      const params = new URLSearchParams({ language });
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }
      
      const response = await fetch(`/api/language-learning/analytics/${userId}?${params}`);
      if (!response.ok) throw new Error('Failed to load analytics');
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    }
  }, [userId]);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/language-learning/settings/${userId}`);
      if (!response.ok) throw new Error('Failed to load settings');
      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    }
  }, [userId]);

  // Start chat session
  const startChatSession = useCallback(async (chatbotId: string, scenarioId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/language-learning/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, chatbotId, scenarioId })
      });
      
      if (!response.ok) throw new Error('Failed to start chat session');
      const session = await response.json();
      setCurrentSession(session);
      
      // Add initial message
      const initialMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sessionId: session.id,
        sender: 'chatbot',
        content: session.scenario.initialPrompt,
        timestamp: new Date().toISOString(),
        audioUrl: `/api/speech/synthesize?text=${encodeURIComponent(session.scenario.initialPrompt)}&language=${selectedLanguage}`
      };
      
      setMessages([initialMessage]);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedLanguage]);

  // Send message to chatbot
  const sendMessage = useCallback(async (message: string, audioUrl?: string) => {
    if (!currentSession) throw new Error('No active session');
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId: currentSession.id,
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      audioUrl
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/language-learning/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message,
          audioUrl
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      const chatbotResponse: ChatbotResponse = await response.json();
      
      const botMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sessionId: currentSession.id,
        sender: 'chatbot',
        content: chatbotResponse.message,
        timestamp: new Date().toISOString(),
        audioUrl: chatbotResponse.audioUrl,
        corrections: chatbotResponse.corrections
      };
      
      setMessages(prev => [...prev, botMessage]);
      return chatbotResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // Analyze speech
  const analyzeSpeech = useCallback(async (audioBlob: Blob, expectedText?: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', selectedLanguage);
      formData.append('userId', userId);
      if (expectedText) formData.append('expectedText', expectedText);
      
      const response = await fetch('/api/language-learning/speech/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to analyze speech');
      const analysis: SpeechAnalysisResponse = await response.json();
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze speech');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, userId]);

  // Save settings
  const saveSettings = useCallback(async (newSettings: Partial<LanguageLearningSettings>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/language-learning/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      await loadSettings(); // Reload settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadSettings]);

  // Change selected language
  const changeLanguage = useCallback((language: LanguageCode) => {
    setSelectedLanguage(language);
    setCurrentSession(null);
    setMessages([]);
    setError(null);
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadSupportedLanguages();
    loadUserProfile();
    loadSettings();
  }, [loadSupportedLanguages, loadUserProfile, loadSettings]);

  // Load language-specific data when language changes
  useEffect(() => {
    loadChatbots(selectedLanguage);
    loadScenarios(selectedLanguage);
    loadExercises(selectedLanguage);
    loadAnalytics(selectedLanguage);
  }, [selectedLanguage, loadChatbots, loadScenarios, loadExercises, loadAnalytics]);

  return {
    // State
    selectedLanguage,
    supportedLanguages,
    chatbots,
    scenarios,
    exercises,
    userProfile,
    analytics,
    settings,
    currentSession,
    messages,
    isLoading,
    error,
    
    // Actions
    changeLanguage,
    startChatSession,
    sendMessage,
    analyzeSpeech,
    saveSettings,
    resetSession,
    
    // Loaders
    loadChatbots,
    loadScenarios,
    loadExercises,
    loadAnalytics,
    loadUserProfile,
    loadSettings
  };
}