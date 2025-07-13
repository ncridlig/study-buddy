// jest.config.ts

import nextJest from 'next/jest';

// Create a Jest config preconfigured for Next.js
const createJestConfig = nextJest({ dir: './' });

// Extend the base config with custom settings
const customJestConfig = {
  // Load custom setup (e.g., for @testing-library/jest-dom)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Simulate the browser environment for React components
  testEnvironment: 'jsdom',

  // Support TypeScript path alias: `@/` => `src/`
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(customJestConfig);
