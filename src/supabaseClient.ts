import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Config Detection:", {
  hasUrl: !!supabaseUrl,
  urlStart: supabaseUrl?.substring(0, 10),
  isDbHost: supabaseUrl?.includes('db.'),
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isConfigured = Boolean(
  isValidUrl(supabaseUrl) && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  !supabaseUrl?.includes('db.')
);

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
      target._realClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    }
    
    return target._realClient[prop];
  }
});

export const isSupabaseConfigured = isConfigured;
