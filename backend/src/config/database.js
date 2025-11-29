const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

if (!config.supabase.url || !config.supabase.serviceKey) {
  throw new Error('Missing Supabase configuration. Check your .env file.');
}

const supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
