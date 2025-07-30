// Language Learning Types

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';
export type ProficiencyLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced' | 'native';
export type ConversationDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ConversationType = 'casual' | 'formal' | 'business' | 'academic' | 'travel' | 'cultural';

// Language Information
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // Unicode flag emoji
  isRTL: boolean; // Right-to-left language
}

// User Language Profile
export interface UserLanguageProfile {
  id: string;
  userId: string;
  nativeLanguages: LanguageCode[];
  learningLanguages: LanguageLearningProgress[];
  preferredPracticeTime: number; // minutes per day
  learningGoals: string[];
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LanguageLearningProgress {
  language: LanguageCode;
  proficiencyLevel: ProficiencyLevel;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number; // in minutes
  conversationsCompleted: number;
  pronunciationScore: number; // 0-100
  vocabularySize: number;
  grammarScore: number; // 0-100
  listeningScore: number; // 0-100
  speakingScore: number; // 0-100
  readingScore: number; // 0-100
  writingScore: number; // 0-100
  lastPracticeDate?: string;
  startedLearningAt: string;
  updatedAt: string;
}

// Chatbot System
export interface LanguageChatbot {
  id: string;
  name: string;
  language: LanguageCode;
  personality: ChatbotPersonality;
  avatar: string;
  description: string;
  specialties: string[];
  difficultyLevel: ConversationDifficulty;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotPersonality {
  traits: string[];
  communicationStyle: 'friendly' | 'professional' | 'encouraging' | 'patient' | 'energetic';
  topics: string[];
  culturalContext: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  chatbotId: string;
  language: LanguageCode;
  scenario: ConversationScenario;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  messageCount: number;
  userProficiencyAtStart: ProficiencyLevel;
  finalScore?: ConversationScore;
  feedback?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'chatbot';
  content: string;
  originalText?: string; // If translated
  translation?: string;
  audioUrl?: string; // For speech synthesis
  timestamp: string;
  corrections?: GrammarCorrection[];
  pronunciationFeedback?: PronunciationFeedback;
  metadata?: Record<string, any>;
}

// Conversation Scenarios
export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  language: LanguageCode;
  type: ConversationType;
  difficulty: ConversationDifficulty;
  estimatedDuration: number; // in minutes
  objectives: string[];
  vocabulary: VocabularyItem[];
  grammarPoints: string[];
  culturalNotes?: string[];
  context: string;
  initialPrompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string; // IPA or phonetic
  partOfSpeech: string;
  definition: string;
  examples: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

// Speech Recognition & Pronunciation
export interface SpeechRecognitionResult {
  id: string;
  userId: string;
  sessionId?: string;
  originalText: string;
  recognizedText: string;
  confidence: number; // 0-1
  language: LanguageCode;
  audioUrl: string;
  duration: number; // in seconds
  pronunciationScore: number; // 0-100
  pronunciationFeedback: PronunciationFeedback;
  timestamp: string;
}

export interface PronunciationFeedback {
  overallScore: number; // 0-100
  accuracy: number; // 0-100
  fluency: number; // 0-100
  completeness: number; // 0-100
  wordScores: WordPronunciationScore[];
  suggestions: string[];
  commonMistakes: string[];
}

export interface WordPronunciationScore {
  word: string;
  score: number; // 0-100
  phonemes: PhonemeScore[];
  issues: string[];
}

export interface PhonemeScore {
  phoneme: string;
  score: number; // 0-100
  feedback: string;
}

// Grammar Correction
export interface GrammarCorrection {
  originalText: string;
  correctedText: string;
  errorType: 'grammar' | 'spelling' | 'punctuation' | 'word-choice' | 'style';
  explanation: string;
  severity: 'minor' | 'moderate' | 'major';
  suggestions: string[];
  position: {
    start: number;
    end: number;
  };
}

// Conversation Assessment
export interface ConversationScore {
  overall: number; // 0-100
  grammar: number; // 0-100
  vocabulary: number; // 0-100
  pronunciation: number; // 0-100
  fluency: number; // 0-100
  comprehension: number; // 0-100
  culturalAwareness: number; // 0-100
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  nextSteps: string[];
  recommendedPractice: string[];
}

// Practice Exercises
export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  language: LanguageCode;
  type: 'pronunciation' | 'conversation' | 'listening' | 'vocabulary' | 'grammar';
  difficulty: ConversationDifficulty;
  estimatedTime: number; // in minutes
  instructions: string[];
  content: ExerciseContent;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseContent {
  // For pronunciation exercises
  targetWords?: string[];
  targetSentences?: string[];
  audioExamples?: string[];
  
  // For conversation exercises
  scenario?: ConversationScenario;
  rolePlayInstructions?: string[];
  
  // For listening exercises
  audioClips?: AudioClip[];
  questions?: Question[];
  
  // For vocabulary exercises
  vocabularyList?: VocabularyItem[];
  
  // For grammar exercises
  grammarRules?: GrammarRule[];
  examples?: string[];
}

export interface AudioClip {
  id: string;
  url: string;
  transcript: string;
  duration: number;
  speaker: string;
  accent: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'open-ended';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: string[];
  exceptions?: string[];
}

// User Progress & Analytics
export interface PracticeSession {
  id: string;
  userId: string;
  exerciseId?: string;
  chatSessionId?: string;
  type: 'exercise' | 'conversation' | 'free-practice';
  language: LanguageCode;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  score?: ConversationScore;
  wordsLearned: string[];
  mistakesMade: GrammarCorrection[];
  pronunciationAttempts: number;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export interface LanguageLearningAnalytics {
  userId: string;
  language: LanguageCode;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalPracticeTime: number;
  sessionsCompleted: number;
  averageSessionDuration: number;
  currentStreak: number;
  longestStreak: number;
  proficiencyProgress: {
    date: string;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    comprehension: number;
  }[];
  weakAreas: string[];
  strongAreas: string[];
  recommendedFocus: string[];
  vocabularyGrowth: {
    date: string;
    wordsLearned: number;
    totalVocabulary: number;
  }[];
  commonMistakes: {
    mistake: string;
    frequency: number;
    lastOccurrence: string;
  }[];
  achievements: LanguageLearningAchievement[];
  nextMilestones: LanguageLearningMilestone[];
}

export interface LanguageLearningAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  language: LanguageCode;
  type: 'streak' | 'proficiency' | 'vocabulary' | 'conversation' | 'pronunciation';
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface LanguageLearningMilestone {
  id: string;
  name: string;
  description: string;
  language: LanguageCode;
  targetProficiency: ProficiencyLevel;
  requirements: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    comprehension: number;
  };
  estimatedTimeToComplete: number; // in hours
  isCompleted: boolean;
  completedAt?: string;
}

// System Configuration
export interface LanguageLearningSettings {
  userId: string;
  speechRecognitionEnabled: boolean;
  speechSynthesisEnabled: boolean;
  autoTranslateEnabled: boolean;
  pronunciationFeedbackLevel: 'basic' | 'detailed' | 'expert';
  correctionStyle: 'immediate' | 'end-of-conversation' | 'manual';
  difficultyAdjustment: 'automatic' | 'manual';
  preferredVoice: {
    [key in LanguageCode]?: string;
  };
  practiceReminders: boolean;
  reminderTime: string; // HH:MM format
  weeklyGoal: number; // minutes per week
  updatedAt: string;
}

// API Response Types
export interface ChatbotResponse {
  message: string;
  audioUrl?: string;
  suggestions?: string[];
  corrections?: GrammarCorrection[];
  vocabularyHelp?: VocabularyItem[];
  culturalTips?: string[];
  nextPrompts?: string[];
}

export interface SpeechAnalysisResponse {
  recognizedText: string;
  confidence: number;
  pronunciationFeedback: PronunciationFeedback;
  corrections?: GrammarCorrection[];
  suggestions: string[];
}

export interface ConversationRecommendation {
  scenario: ConversationScenario;
  reason: string;
  estimatedDifficulty: ConversationDifficulty;
  focusAreas: string[];
}