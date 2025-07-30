# Project Structure

The **Grow School** application is built with Next.js 15 and follows modern React patterns with a clear separation of concerns, promoting reusability and maintainability.

## Root Directory Structure

```
grow_school_latest/
├── src/                    # Source code directory
│   ├── app/               # Next.js App Router pages and API routes
│   ├── backend/           # Backend services and business logic
│   ├── components/        # React components organized by feature
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and configurations
│   ├── middleware/        # Next.js middleware
│   ├── docs/              # Project documentation
│   ├── types.ts           # Global TypeScript type definitions
│   ├── constants.tsx      # Application-wide constants
│   └── metadata.json      # Project metadata
├── __tests__/             # Test files and utilities
├── public/                # Static assets
├── scripts/               # Build and utility scripts
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Project overview
```

## Source Directory (`/src`)

### `/src/app` - Next.js App Router

The app directory follows Next.js 15 App Router conventions with file-based routing:

```
app/
├── layout.tsx             # Root layout component
├── page.tsx               # Home page
├── globals.css            # Global styles
├── favicon.ico            # Site favicon
├── api/                   # API routes
│   ├── auth/              # Authentication endpoints
│   ├── journal/           # Journal API endpoints
│   ├── wellness/          # Wellness tracking endpoints
│   ├── creative-assistant/ # AI creative tools endpoints
│   ├── learning-guide/    # Learning path endpoints
│   ├── calendar/          # Calendar management endpoints
│   ├── communications/    # Messaging endpoints
│   ├── analytics/         # Analytics endpoints
│   ├── school-hub/        # School management endpoints
│   └── system-settings/   # System configuration endpoints
├── dashboard/             # Dashboard pages
├── school-hub/            # School management pages
├── learning-guide/        # Learning path pages
├── creative-assistant/    # AI creative tools pages
├── journal/               # Personal journal pages
├── mood-focus-checkin/    # Wellness tracking pages
├── mindfulness-tools/     # Mental health tools pages
├── language-learning/     # Language practice pages
├── study-assistant/       # Study tools pages
├── knowledge-base/        # Information repository pages
├── analytics/             # Performance tracking pages
├── communications/        # Messaging system pages
├── calendar/              # Event management pages
├── marketplace/           # Resource sharing pages
├── concierge-ai/          # AI assistant pages
├── system-settings/       # Admin settings pages
└── login/                 # Authentication pages
```

### `/src/backend` - Backend Services

Organized in layers following clean architecture principles:

```
backend/
├── api/                   # API business logic
│   ├── journalAPI.ts      # Journal operations
│   ├── moodFocusCheckInAPI.ts # Wellness tracking
│   ├── creativeAssistantAPI.ts # AI creative tools
│   ├── learningGuideAPI.ts # Learning paths
│   ├── calendarAPI.ts     # Calendar management
│   ├── communicationsAPI.ts # Messaging
│   ├── analyticsAPI.ts    # Analytics
│   └── schoolHubAPI.ts    # School management
├── services/              # Service layer
│   ├── journalService.ts  # Journal business logic
│   ├── userService.ts     # User management
│   ├── authService.ts     # Authentication logic
│   ├── creativeAssistantService.ts # AI services
│   ├── learningGuideService.ts # Learning logic
│   ├── calendarService.ts # Calendar logic
│   ├── communicationsService.ts # Messaging logic
│   ├── analyticsService.ts # Analytics logic
│   └── schoolHubService.ts # School logic
├── repositories/          # Data access layer
│   ├── journalRepository.ts # Journal data access
│   ├── userRepository.ts  # User data access
│   ├── calendarRepository.ts # Calendar data access
│   └── schoolHubRepository.ts # School data access
├── validation/            # Input validation schemas
│   ├── journalSchemas.ts  # Journal validation
│   ├── userSchemas.ts     # User validation
│   ├── calendarSchemas.ts # Calendar validation
│   └── schoolHubSchemas.ts # School validation
├── pocketbase/            # Database files and migrations
│   ├── pb_data/           # PocketBase data directory
│   ├── pb_migrations/     # Database migrations
│   └── pb_hooks/          # Database hooks
└── db.ts                  # Database connection and configuration
```

### `/src/components` - React Components

Components are organized by feature and reusability:

```
components/
├── ui/                    # Base UI components
│   ├── Button.tsx         # Button component
│   ├── Input.tsx          # Input component
│   ├── Modal.tsx          # Modal component
│   ├── Card.tsx           # Card component
│   ├── Badge.tsx          # Badge component
│   ├── Avatar.tsx         # Avatar component
│   ├── Dropdown.tsx       # Dropdown component
│   ├── Tabs.tsx           # Tabs component
│   ├── Toast.tsx          # Toast notification
│   └── index.ts           # UI components export
├── layout/                # Layout components
│   ├── Header.tsx         # Global header
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Footer.tsx         # Global footer
│   ├── Navigation.tsx     # Main navigation
│   ├── Breadcrumbs.tsx    # Breadcrumb navigation
│   └── Layout.tsx         # Main layout wrapper
├── modules/               # Feature-specific components
│   ├── dashboard/         # Dashboard components
│   ├── analytics/         # Analytics components
│   ├── school-hub/        # School management components
│   ├── communications/    # Messaging components
│   ├── knowledge-base/    # Knowledge base components
│   ├── concierge-ai/      # AI assistant components
│   ├── marketplace/       # Marketplace components
│   └── system-settings/   # Settings components
├── school-hub/            # School management specific
│   ├── StudentCard.tsx    # Student information card
│   ├── ClassCard.tsx      # Class information card
│   ├── TeacherCard.tsx    # Teacher information card
│   ├── EnrollmentForm.tsx # Student enrollment form
│   ├── GradeBook.tsx      # Grade management
│   ├── AttendanceTracker.tsx # Attendance tracking
│   └── ParentPortal.tsx   # Parent access portal
├── journal/               # Journal specific components
│   ├── JournalEntry.tsx   # Individual journal entry
│   ├── JournalList.tsx    # List of journal entries
│   ├── JournalEditor.tsx  # Entry creation/editing
│   ├── MoodSelector.tsx   # Mood selection component
│   ├── TagSelector.tsx    # Tag management
│   └── JournalAnalytics.tsx # Journal insights
├── wellness/              # Wellness tracking components
│   ├── MoodTracker.tsx    # Mood tracking interface
│   ├── FocusTracker.tsx   # Focus level tracking
│   ├── StressTracker.tsx  # Stress level tracking
│   ├── WellnessChart.tsx  # Wellness data visualization
│   ├── MindfulnessTimer.tsx # Meditation timer
│   └── WellnessTips.tsx   # Wellness recommendations
├── creative/              # Creative tools components
│   ├── BrainstormingTool.tsx # AI brainstorming interface
│   ├── WritingAssistant.tsx # Writing help tool
│   ├── IdeaGenerator.tsx  # Idea generation tool
│   ├── CreativePrompts.tsx # Creative writing prompts
│   └── ProjectGallery.tsx # Creative project showcase
├── learning-guide/        # Learning path components
│   ├── LearningPath.tsx   # Learning path display
│   ├── LessonCard.tsx     # Individual lesson card
│   ├── ProgressTracker.tsx # Learning progress
│   ├── SkillAssessment.tsx # Skill evaluation
│   ├── RecommendationEngine.tsx # Learning recommendations
│   └── StudyPlan.tsx      # Personalized study plans
├── language-learning/     # Language learning components
│   ├── ConversationPractice.tsx # AI conversation
│   ├── VocabularyTrainer.tsx # Vocabulary practice
│   ├── GrammarExercises.tsx # Grammar practice
│   ├── PronunciationGuide.tsx # Pronunciation help
│   └── LanguageProgress.tsx # Language learning progress
├── auth/                  # Authentication components
│   ├── LoginForm.tsx      # Login form
│   ├── RegisterForm.tsx   # Registration form
│   ├── ForgotPassword.tsx # Password reset
│   ├── ProfileSettings.tsx # User profile management
│   └── PermissionGuard.tsx # Role-based access control
├── overlays/              # Overlay system components
│   ├── GameOverlay.tsx    # Gamification overlay
│   ├── HobbyOverlay.tsx   # Hobby tracking overlay
│   ├── StudioOverlay.tsx  # Creative studio overlay
│   └── MarketplaceOverlay.tsx # Marketplace overlay
├── conflict-resolution/   # Conflict management
│   ├── ConflictDetector.tsx # Conflict detection
│   ├── ConflictResolver.tsx # Conflict resolution
│   └── ConflictHistory.tsx # Conflict tracking
├── error-boundaries/      # Error handling
│   ├── ErrorBoundary.tsx  # React error boundary
│   ├── ErrorFallback.tsx  # Error display component
│   └── NotFound.tsx       # 404 error page
├── demo/                  # Demo and example components
│   ├── DemoData.tsx       # Demo data generators
│   ├── FeatureShowcase.tsx # Feature demonstrations
│   └── TutorialGuide.tsx  # User onboarding
├── icons/                 # Icon components
│   ├── index.tsx          # Icon exports
│   ├── lucide.tsx         # Lucide icon re-exports
│   └── custom.tsx         # Custom icon components
└── icons.tsx              # Main icon configuration
```

### `/src/hooks` - Custom React Hooks

Custom hooks that encapsulate reusable logic:

```
hooks/
├── useAppContext.ts       # Global application state management
├── useConciergeAI.ts      # AI assistant chat functionality
├── useConflictManagement.ts # Conflict detection and resolution
└── useToast.tsx           # Toast notification management
```

**Key Hooks:**
- `useAppContext.ts`: Provides global application state management using React Context
- `useConciergeAI.ts`: Manages AI assistant interactions with Ollama service
- `useConflictManagement.ts`: Handles data conflict detection and resolution
- `useToast.tsx`: Manages toast notifications across the application

### `/src/lib` - Utility Libraries

Shared utilities, configurations, and helper functions:

```
lib/
├── api-client.ts          # API client configuration
├── authorization.ts       # Role-based access control
├── authorization-test.ts  # Authorization testing utilities
├── backend-integration.ts # Backend service integration
├── conflict-detection.ts  # Data conflict detection
├── constants.ts           # Application constants
├── csrf.ts                # CSRF protection utilities
├── db.ts                  # Database connection and utilities
├── email-service.ts       # Email service integration
├── logger.ts              # Logging utilities
├── notification-service.ts # Notification management
├── ollama-client.ts       # Ollama AI service client
├── optimisticUpdateManager.ts # Optimistic UI updates
├── persistence.ts         # Data persistence utilities
├── rate-limit.ts          # API rate limiting
├── recurrencePatternUtils.ts # Calendar recurrence patterns
├── secure-cookie.ts       # Secure cookie management
├── test-auth-utils.ts     # Authentication testing utilities
├── test-authorization.ts  # Authorization testing
├── test-websocket.ts      # WebSocket testing utilities
├── theme.ts               # Theme configuration
├── types.ts               # Shared type definitions
├── utils.ts               # General utility functions
├── websocket-service.ts   # WebSocket service
├── data/                  # Static data and configurations
└── pocketbase-example.txt # PocketBase usage examples
```

### `/src/middleware` - Next.js Middleware

```
middleware/
├── auth.ts                # Authentication middleware
└── middleware.ts          # Main middleware configuration
```

## Test Directory (`/__tests__`)

Comprehensive testing structure:

```
__tests__/
├── api/                   # API endpoint tests
├── integration/           # Integration tests
│   └── user-workflow.test.ts # End-to-end user workflows
├── lib/                   # Library and utility tests
│   └── authorization-simple.test.ts # Authorization tests
├── utils/                 # Test utilities and helpers
│   └── test-helpers.ts    # Shared testing utilities
├── setup.test.ts          # Test setup configuration
└── jest.setup.js          # Jest configuration
```

## Configuration Files

### Root Level Configuration

- **`package.json`**: Dependencies, scripts, and project metadata
- **`next.config.ts`**: Next.js configuration with TypeScript
- **`tailwind.config.js`**: Tailwind CSS configuration
- **`tsconfig.json`**: TypeScript compiler configuration
- **`jest.config.js`**: Jest testing framework configuration
- **`eslint.config.mjs`**: ESLint code quality configuration
- **`postcss.config.mjs`**: PostCSS configuration for Tailwind

### Environment Configuration

- **`.env.local`**: Local development environment variables
- **`.env.example`**: Example environment variables template
- **`.gitignore`**: Git ignore patterns
- **`README.md`**: Project overview and setup instructions
- **`SETUP_GUIDE.md`**: Detailed setup instructions
- **`TESTING.md`**: Testing guidelines and procedures

## Key Architectural Patterns

### 1. Feature-Based Organization

Components and logic are organized by feature rather than by type, making it easier to locate and maintain related code.

### 2. Layered Backend Architecture

- **API Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic
- **Repository Layer**: Manages data access
- **Validation Layer**: Ensures data integrity

### 3. Separation of Concerns

- **Pages**: Handle routing and page-level logic
- **Components**: Manage UI rendering and user interactions
- **Hooks**: Encapsulate reusable stateful logic
- **Services**: Handle external API calls and business logic
- **Utilities**: Provide helper functions and configurations

### 4. Type Safety

- Comprehensive TypeScript usage throughout the application
- Shared type definitions in `types.ts`
- Zod schemas for runtime validation
- Strict TypeScript configuration

### 5. Testing Strategy

- Unit tests for individual components and functions
- Integration tests for feature workflows
- API tests for backend endpoints
- Test utilities for consistent testing patterns

## Development Workflow

### 1. File Naming Conventions

- **Components**: PascalCase (e.g., `JournalEntry.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useJournal.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase interfaces (e.g., `User`, `JournalEntry`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

### 2. Import Organization

```typescript
// External libraries
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

// Internal utilities and types
import { validateInput } from '@/lib/validation';
import { User, JournalEntry } from '@/types';

// Components
import { Button } from '@/components/ui/Button';
import { JournalCard } from '@/components/journal/JournalCard';
```

### 3. Component Structure

```typescript
// Component props interface
interface ComponentProps {
  // Props definition
}

// Main component
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Event handlers
  // Render
}

// Default export
export default Component;
```

## Scalability Considerations

### 1. Modular Architecture

The application is designed to support easy addition of new features and modules without affecting existing functionality.

### 2. Performance Optimization

- Code splitting at the route level
- Lazy loading for heavy components
- Optimized images and assets
- Efficient state management

### 3. Maintainability

- Clear separation of concerns
- Comprehensive documentation
- Consistent coding patterns
- Automated testing

### 4. Extensibility

- Plugin-like module system
- Configurable themes and layouts
- Flexible permission system
- Modular AI integrations

This structure supports the application's growth while maintaining code quality, performance, and developer experience.
