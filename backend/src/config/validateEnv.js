const config = require('./env');

const requiredEnvVars = {
  SUPABASE_URL: config.supabase.url,
  SUPABASE_ANON_KEY: config.supabase.anonKey,
  SUPABASE_SERVICE_KEY: config.supabase.serviceKey,
  JWT_SECRET: config.jwt.secret,
  JWT_EXPIRES_IN: config.jwt.expiresIn,
};

function validateEnv() {
  const missing = [];
  const invalid = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value === 'undefined' || value === '') {
      missing.push(key);
    }
  });

  // Validate JWT_SECRET is strong enough
  if (config.jwt.secret && config.jwt.secret.length < 32) {
    invalid.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate SUPABASE_URL format
  if (config.supabase.url && !config.supabase.url.startsWith('https://')) {
    invalid.push('SUPABASE_URL must start with https://');
  }

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => {
      // eslint-disable-next-line no-console
      console.error(`   - ${key}`);
    });
    // eslint-disable-next-line no-console
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  if (invalid.length > 0) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variable values:');
    invalid.forEach((error) => {
      // eslint-disable-next-line no-console
      console.error(`   - ${error}`);
    });
    process.exit(1);
  }

  // Warn about development environment in production
  if (config.env === 'production' && config.jwt.secret.includes('change-this')) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  WARNING: Using default JWT_SECRET in production is insecure!');
  }

  // eslint-disable-next-line no-console
  console.log('✅ Environment variables validated successfully');
}

module.exports = { validateEnv };
