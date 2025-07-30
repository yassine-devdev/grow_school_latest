#!/usr/bin/env node

/**
 * Test runner for component integration tests
 * Runs component tests with real API calls and proper setup
 */

const { execSync } = require('child_process');
const path = require('path');

// Test configuration
const testConfig = {
  testMatch: [
    '<rootDir>/__tests__/integration/components/**/*.test.{ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/integration/setup-integration-tests.js'
  ],
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage/integration',
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: '50%', // Limit workers for API calls
  verbose: true
};

// Command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isCoverage = args.includes('--coverage');
const isVerbose = args.includes('--verbose');
const testPattern = args.find(arg => arg.startsWith('--testNamePattern='));

// Build Jest command
let jestCommand = 'jest';

// Add test pattern
jestCommand += ` "${testConfig.testMatch.join('" "')}"`;

// Add configuration
jestCommand += ` --testEnvironment=${testConfig.testEnvironment}`;
jestCommand += ` --setupFilesAfterEnv="${testConfig.setupFilesAfterEnv.join('" "')}"`;
jestCommand += ` --testTimeout=${testConfig.testTimeout}`;
jestCommand += ` --maxWorkers=${testConfig.maxWorkers}`;

// Add optional flags
if (isWatch) {
  jestCommand += ' --watch';
}

if (isCoverage) {
  jestCommand += ` --coverage`;
  jestCommand += ` --collectCoverageFrom="${testConfig.collectCoverageFrom.join('" "')}"`;
  jestCommand += ` --coverageDirectory="${testConfig.coverageDirectory}"`;
  jestCommand += ` --coverageReporters="${testConfig.coverageReporters.join('" "')}"`;
}

if (isVerbose || testConfig.verbose) {
  jestCommand += ' --verbose';
}

if (testPattern) {
  jestCommand += ` ${testPattern}`;
}

// Add any remaining arguments
const remainingArgs = args.filter(arg => 
  !arg.startsWith('--watch') && 
  !arg.startsWith('--coverage') && 
  !arg.startsWith('--verbose') &&
  !arg.startsWith('--testNamePattern=')
);

if (remainingArgs.length > 0) {
  jestCommand += ` ${remainingArgs.join(' ')}`;
}

console.log('🧪 Running Component Integration Tests...');
console.log(`Command: ${jestCommand}`);
console.log('');

try {
  // Run the tests
  execSync(jestCommand, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('');
  console.log('✅ Component integration tests completed successfully!');
  
  if (isCoverage) {
    console.log(`📊 Coverage report generated in: ${testConfig.coverageDirectory}`);
  }
  
} catch (error) {
  console.error('');
  console.error('❌ Component integration tests failed!');
  console.error('Error:', error.message);
  process.exit(1);
}