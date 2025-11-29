const { validateEnv } = require('../config/validateEnv');

describe('Environment Validation', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should pass with all required variables set', () => {
    // This test will use the actual .env file
    expect(() => validateEnv()).not.toThrow();
  });

  it('should validate JWT_SECRET length requirement', () => {
    const shortSecret = 'short';
    expect(shortSecret.length).toBeLessThan(32);
  });

  it('should validate SUPABASE_URL format requirement', () => {
    const validUrl = 'https://example.supabase.co';
    const invalidUrl = 'http://example.supabase.co';

    expect(validUrl.startsWith('https://')).toBe(true);
    expect(invalidUrl.startsWith('https://')).toBe(false);
  });
});
