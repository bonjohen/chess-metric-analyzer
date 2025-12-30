/**
 * Vitest setup file
 * Runs before all tests
 */

// Add any global test setup here
// For example, custom matchers, global mocks, etc.

// Example: Add custom matchers for chess positions
import { expect } from 'vitest';

// Custom matcher to check if a FEN string is valid
expect.extend({
  toBeValidFEN(received: string) {
    const fenRegex =
      /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s\d+\s\d+$/;
    const pass = fenRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid FEN`
          : `Expected ${received} to be a valid FEN`,
    };
  },
});

// Extend TypeScript types for custom matchers
declare module 'vitest' {
  interface Assertion {
    toBeValidFEN(): void;
  }
  interface AsymmetricMatchersContaining {
    toBeValidFEN(): void;
  }
}

