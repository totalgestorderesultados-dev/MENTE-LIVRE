import { createBrowserClient } from '@supabase/ssr';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl?.trim();
const supabaseAnonKey = rawKey?.trim();

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Allow any protocol technically, but warn if not https
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    // If it doesn't have a protocol, try adding https://
    if (url && !url.includes('://')) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

const isConfigured = Boolean(
  isValidUrl(supabaseUrl) && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  !supabaseUrl?.includes('db.')
);

// Helpful logs for debugging in devtools (will not show secrets)
if (process.env.NODE_ENV !== 'production') {
  console.log('Supabase check:', {
    hasUrl: !!supabaseUrl,
    urlStatus: isValidUrl(supabaseUrl) ? 'valid' : 'invalid',
    hasKey: !!supabaseAnonKey,
    keyValid: supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key',
    isDbHost: supabaseUrl?.includes('db.')
  });
}

// Lazy initialization proxy to avoid crashing at module load time
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (prop === '_isConfigured') return isConfigured;
    if (prop === '_config') return { supabaseUrl, supabaseAnonKey };

    if (!isConfigured) {
      // Return a safe dummy structure that won't crash on common calls
      const dummyError = { error: { message: "Supabase não configurado" }, data: null };
      const dummyPromise = Promise.resolve(dummyError);
      
      const chainable = {
        select: () => chainable,
        order: () => dummyPromise,
        eq: () => chainable,
        single: () => dummyPromise,
        insert: () => dummyPromise,
        update: () => dummyPromise,
        delete: () => dummyPromise,
        upsert: () => dummyPromise,
        match: () => chainable,
      };

      if (prop === 'auth') return { 
        signInWithOtp: async () => dummyError,
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => dummyError,
      };
      
      if (prop === 'from') return () => ({ ...chainable });
      
      return () => dummyPromise;
    }
    
    // Initialize real client on first access
    if (!target._realClient) {
      // Handle cases where URL might be missing protocol by accident
      let finalUrl = supabaseUrl!;
      if (!finalUrl.includes('://')) finalUrl = `https://${finalUrl}`;
      
      // Critical Fix for PGRST125: Ensure only the origin (protocol + host) is used
      // If user pasted something like https://xyz.supabase.co/rest/v1, this fixes it.
      try {
        const urlObj = new URL(finalUrl);
        finalUrl = urlObj.origin;
      } catch (e) {
        console.error("Erro ao processar URL do Supabase:", e);
      }
      
      target._realClient = createBrowserClient(finalUrl, supabaseAnonKey!);
    }
    
    return target._realClient[prop];
  }
});

export const isSupabaseConfigured = isConfigured;
