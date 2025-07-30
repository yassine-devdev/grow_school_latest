# GROW YouR NEED Saas School - Next.js Version

A comprehensive school management system with AI-powered features, converted from Vite to Next.js.

## 🚀 Features

- **Dashboard Module**: Overview of school metrics and analytics
- **Analytics Module**: Detailed analytics and reporting
- **School Hub Module**: Comprehensive school management tools
- **Communications Module**: Internal communication system
- **Knowledge Base Module**: Educational resources and content
- **Concierge AI Module**: AI-powered assistance using Google Gemini
- **Marketplace Module**: Educational marketplace
- **System Settings Module**: Configuration and preferences

## 🛠 Tech Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphic design
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd grow_school_latest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Google Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Build and Deploy

### Development
```bash
npm run dev          # Start development server
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── icons/         # Icon system
│   ├── layout/        # Layout components
│   ├── modules/       # Feature modules
│   ├── overlays/      # Full-screen overlays
│   └── ui/           # Reusable UI components
├── hooks/             # Custom React hooks
├── docs/              # Documentation
├── constants.tsx      # App constants
├── types.ts          # TypeScript types
└── metadata.json     # Project metadata
```

## 🎨 Design System

The application uses a custom glassmorphic design system with:
- **Fonts**: Orbitron (headings), Roboto (body text)
- **Colors**: Purple-based theme with glassmorphic effects
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first responsive design

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `NODE_ENV`: Environment (development/production)

### Next.js Configuration
- TypeScript and ESLint checking disabled during builds for faster development
- Optimized package imports for better performance
- Custom path aliases (@/* -> src/*)

## 🚀 Deployment

The application is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** containers

### Vercel Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📝 Migration Notes

This project was successfully migrated from Vite to Next.js with:
- ✅ All components preserved
- ✅ Styling system maintained
- ✅ AI functionality intact
- ✅ Build optimization enabled
- ✅ Development tools configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.
