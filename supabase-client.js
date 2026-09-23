// Precepta — shared Supabase client singleton (static-hosting friendly)
// The project URL and publishable key are loaded from supabase-config.js.

let client = null;

export function getSupabase() {
  if (client) return client;

  const config = window.__SUPABASE_CONFIG__;
  if (!config || !config.url || !config.key ||
      config.url.includes('PASTE_YOUR_') || config.key.includes('PASTE_YOUR_')) {
    throw new Error('Supabase is not configured. Open supabase-config.js and add your Project URL and Publishable key.');
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('The Supabase library did not load. Check your internet connection and try again.');
  }

  client = window.supabase.createClient(config.url, config.key);
  return client;
}
