/**
 * Smoke test to verify test infrastructure is working
 */
import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM APIs', () => {
    const div = document.createElement('div');
    expect(div).toBeDefined();
    expect(div.tagName).toBe('DIV');
  });

  it('should validate FEN strings with custom matcher', () => {
    const validFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const invalidFEN = 'not a fen';

    expect(validFEN).toBeValidFEN();
    expect(invalidFEN).not.toBeValidFEN();
  });

  it('should load configuration files', async () => {
    const pieceValues = await import('../src/config/defaultPieceValues.json');
    expect(pieceValues.default).toBeDefined();
    expect(pieceValues.default.p).toBe(1);
    expect(pieceValues.default.q).toBe(9);
  });

  it('should load profiles', async () => {
    const profiles = await import('../src/config/defaultProfiles.json');
    expect(profiles.default.profiles).toBeDefined();
    expect(profiles.default.profiles.length).toBeGreaterThan(0);
    expect(profiles.default.default).toBe('Balanced');
  });
});

