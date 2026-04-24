import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key';

// Lazy initialization proxy to avoid crashing at module load time
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!isConfigured) {
      throw new Error(
        'Supabase is not configured correctly. \n\n' +
        'Please ensure you have set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Settings menu.\n' +
        'URL must be a valid https://... address.'
      );
    }
    
    // Initialize real client on first access
    if (!target._realClient) {
      target._realClient = createClient(supabaseUrl!, supabaseAnonKey!);
    }
    
    return target._realClient[prop];
  }
});

export const isSupabaseConfigured = isConfigured;
