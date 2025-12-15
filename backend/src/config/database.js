const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const config = require('./env');

if (!config.supabase.url || !config.supabase.serviceKey) {
  throw new Error('Missing Supabase configuration. Check your .env file.');
}

// Supabase client for auth and some operations
const supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// PostgreSQL connection pool for direct database access
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
module.exports.supabase = supabase;
