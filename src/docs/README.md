# Grow School Documentation

Welcome to the comprehensive documentation for Grow School, an innovative educational platform built with Next.js 15, TypeScript, and modern web technologies.

## Overview

Grow School is a modern educational platform that combines traditional learning with innovative features like AI assistance, wellness tracking, creative tools, and comprehensive school management systems. Built with Next.js App Router, TypeScript, Tailwind CSS, and PocketBase.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes, PocketBase database
- **AI Integration**: Ollama AI service (replacing Google Gemini)
- **Testing**: Jest, React Testing Library, Supertest
- **State Management**: React Context, Redux Toolkit
- **Authentication**: Custom auth with PocketBase
- **Real-time**: WebSocket integration

## Quick Start

1. **Installation**: Follow the [Setup Guide](../SETUP_GUIDE.md)
2. **Architecture**: Understand the [Project Structure](STRUCTURE.md)
3. **Development**: Learn about [State Management](STATE_MANAGEMENT.md)
4. **UI/UX**: Explore [UI Components](UI_COMPONENTS.md) and [Theming](THEMING.md)
5. **Testing**: Review [Testing Guide](../TESTING.md)

## Project Structure

```
grow_school_latest/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── school-hub/        # School management pages
│   │   ├── learning-guide/    # Learning path pages
│   │   ├── creative-assistant/ # AI creative tools
│   │   ├── journal/           # Personal journal
│   │   ├── mood-focus-checkin/ # Wellness tracking
│   │   ├── mindfulness-tools/ # Mental health tools
│   │   ├── language-learning/ # Language practice
│   │   ├── study-assistant/   # Study tools
│   │   ├── knowledge-base/    # Information repository
│   │   ├── analytics/         # Performance tracking
│   │   ├── communications/    # Messaging system
│   │   ├── calendar/          # Event management
│   │   ├── marketplace/       # Resource sharing
│   │   ├── concierge-ai/      # AI assistant
│   │   ├── system-settings/   # Admin settings
│   │   └── login/             # Authentication
│   ├── backend/               # Backend services
│   │   ├── api/              # Business logic APIs
│   │   ├── services/         # Service layer
│   │   ├── repositories/     # Data access layer
│   │   ├── validation/       # Input validation
│   │   └── pocketbase/       # Database files
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── modules/         # Feature-specific components
│   │   ├── school-hub/      # School management components
│   │   ├── journal/         # Journal components
│   │   ├── wellness/        # Wellness components
│   │   ├── creative/        # Creative tools components
│   │   ├── learning-guide/  # Learning path components
│   │   ├── language-learning/ # Language components
│   │   ├── auth/            # Authentication components
│   │   ├── overlays/        # Overlay components
│   │   ├── conflict-resolution/ # Conflict management
│   │   ├── error-boundaries/ # Error handling
│   │   ├── demo/            # Demo components
│   │   └── icons/           # Icon components
│   ├── lib/                 # Utility libraries
│   ├── hooks/               # Custom React hooks
│   ├── middleware/          # Next.js middleware
│   ├── types.ts            # Global TypeScript types
│   └── docs/               # Documentation
├── __tests__/              # Test files
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
└── package.json           # Dependencies and scripts
```

## Core Features

### Educational Modules
- **Dashboard**: Central hub with personalized overview
- **School Hub**: Complete school management system
- **Learning Guide**: AI-powered personalized learning paths
- **Knowledge Base**: Searchable information repository
- **Analytics**: Comprehensive performance tracking
- **Study Assistant**: AI-powered study recommendations

### AI-Powered Features
- **Concierge AI**: Intelligent navigation and support assistant
- **Creative Assistant**: AI-powered brainstorming and content creation
- **Language Learning**: Interactive AI conversation practice
- **Learning Content Generation**: Personalized educational content

### Wellness & Personal Development
- **Journal**: Personal reflection with mood tracking
- **Mood & Focus Check-in**: Mental wellness monitoring
- **Mindfulness Tools**: Guided meditation and stress management
- **Gamification**: Achievement system and progress tracking

### Communication & Collaboration
- **Communications**: Real-time messaging and collaboration
- **Calendar**: Event management with recurring patterns
- **Marketplace**: Resource sharing and educational marketplace

### Administration & Management
- **System Settings**: Platform configuration and management
- **User Management**: Role-based access control
- **Finance Management**: Billing and payment processing
- **Marketing Tools**: Promotional and outreach features

## Documentation Structure

```
docs/
├── README.md                 # This overview document
├── STRUCTURE.md             # Detailed project architecture
├── STATE_MANAGEMENT.md      # State management patterns
├── UI_COMPONENTS.md         # Component library guide
├── THEMING.md              # Design system and styling
├── AI_INTEGRATION.md       # AI features and integration
├── API_REFERENCE.md        # API endpoints documentation
├── TESTING.md              # Testing strategies and guides
├── DEPLOYMENT.md           # Deployment and production setup
├── SECURITY.md             # Security best practices
├── PERFORMANCE.md          # Performance optimization
├── modules/                # Core module documentation
│   ├── DASHBOARD.md
│   ├── SCHOOL_HUB.md
│   ├── LEARNING_GUIDE.md
│   ├── KNOWLEDGE_BASE.md
│   ├── ANALYTICS.md
│   ├── COMMUNICATIONS.md
│   ├── CONCIERGE_AI.md
│   ├── MARKETPLACE.md
│   └── SYSTEM_SETTINGS.md
├── overlays/               # Overlay system documentation
│   ├── GAMIFICATION.md
│   ├── HOBBIES.md
│   ├── MARKETPLACE.md
│   └── STUDIO.md
└── school-hub/            # School management documentation
    ├── ADMINISTRATION.md
    ├── FINANCE.md
    ├── MARKETING.md
    ├── PARENT.md
    ├── SCHOOL.md
    ├── STUDENT.md
    └── TEACHER.md
```

## Getting Started

### For Developers
1. **Setup**: Follow the [Setup Guide](../SETUP_GUIDE.md) for local development
2. **Architecture**: Read [Project Structure](STRUCTURE.md) to understand the codebase
3. **State Management**: Review [State Management](STATE_MANAGEMENT.md) for data flow
4. **Components**: Explore [UI Components](UI_COMPONENTS.md) for available components
5. **AI Integration**: Check [AI Integration](AI_INTEGRATION.md) for AI features
6. **Testing**: Follow [Testing Guide](../TESTING.md) for test strategies
7. **API**: Reference [API Documentation](API_REFERENCE.md) for backend endpoints

### For Educators
1. **Getting Started**: Begin with [School Hub](school-hub/SCHOOL.md)
2. **Student Management**: Learn [Student Tools](school-hub/STUDENT.md)
3. **Teaching Tools**: Explore [Teacher Features](school-hub/TEACHER.md)
4. **Parent Engagement**: Review [Parent Portal](school-hub/PARENT.md)
5. **Learning Paths**: Understand [Learning Guide](modules/LEARNING_GUIDE.md)

### For Administrators
1. **System Setup**: Review [Administration Guide](school-hub/ADMINISTRATION.md)
2. **Configuration**: Check [System Settings](modules/SYSTEM_SETTINGS.md)
3. **Analytics**: Explore [Analytics Dashboard](modules/ANALYTICS.md)
4. **Finance**: Review [Finance Management](school-hub/FINANCE.md)
5. **Security**: Follow [Security Guidelines](SECURITY.md)

### For Students
1. **Dashboard**: Start with [Dashboard Overview](modules/DASHBOARD.md)
2. **Learning**: Explore [Learning Guide](modules/LEARNING_GUIDE.md)
3. **Wellness**: Use [Wellness Tools](../components/wellness/)
4. **Creativity**: Try [Creative Assistant](../app/creative-assistant/)
5. **Communication**: Connect via [Communications](modules/COMMUNICATIONS.md)

## Development Workflow

1. **Local Setup**: Install dependencies and start development server
2. **Feature Development**: Create feature branches and follow coding standards
3. **Testing**: Write and run tests for new features
4. **Code Review**: Submit pull requests for review
5. **Deployment**: Deploy to staging and production environments

## Key Technologies

- **Next.js 15**: App Router, Server Components, API Routes
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **PocketBase**: Real-time database with authentication
- **Ollama AI**: Local AI service for intelligent features
- **Jest**: Unit and integration testing
- **ESLint/Prettier**: Code quality and formatting

## Contributing

1. Follow the established project structure
2. Write comprehensive tests for new features
3. Update documentation for any changes
4. Follow TypeScript best practices
5. Ensure accessibility compliance
6. Optimize for performance

## Support & Resources

- **Technical Documentation**: Detailed guides in this docs folder
- **API Reference**: Complete API documentation
- **Component Library**: Storybook documentation (if available)
- **Issue Tracking**: GitHub issues for bug reports and feature requests
- **Community**: Discussion forums and support channels

## License

This project is proprietary software. All rights reserved.
