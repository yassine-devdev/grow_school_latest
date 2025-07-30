const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Base configuration shared between projects
const baseConfig = {
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
    '<rootDir>/e2e/'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    // Include video editor components
    'src/components/overlays/studio/react-video-editor-pro-main/components/**/*.{js,jsx,ts,tsx}',
    '!src/components/overlays/studio/react-video-editor-pro-main/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$": "identity-obj-proxy",
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(whatwg-fetch|@testing-library)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
}

// Multi-project configuration for different test environments
const customJestConfig = {
  projects: [
    // Node.js environment for API and backend tests
    {
      ...baseConfig,
      displayName: {
        name: 'node',
        color: 'blue'
      },
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/api/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/__tests__/integration/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/__tests__/lib/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/__tests__/utils/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/utils/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/lib/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/backend/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/middleware/**/*.(test|spec).(js|jsx|ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.node.js'],
      testEnvironmentOptions: {
        node: {
          experimental: {
            vm: true
          }
        }
      }
    },
    // jsdom environment for component and hook tests
    {
      ...baseConfig,
      displayName: {
        name: 'jsdom',
        color: 'magenta'
      },
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/hooks/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/components/**/*.(test|spec).(js|jsx|ts|tsx)',
        '<rootDir>/src/app/**/*.(test|spec).(js|jsx|ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironmentOptions: {
        jsdom: {
          url: 'http://localhost:3000'
        }
      }
    }
  ],
  // Global settings
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  maxWorkers: '50%',
  testTimeout: 10000
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)