import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const missingEnvError = new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
const noopSubscription = { unsubscribe() {} };

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: missingEnvError }),
    onAuthStateChange: () => ({ data: { subscription: noopSubscription } }),
    signOut: async () => ({ error: missingEnvError }),
    signInWithPassword: async () => ({ data: null, error: missingEnvError }),
    signUp: async () => ({ data: null, error: missingEnvError }),
    updateUser: async () => ({ data: null, error: missingEnvError }),
    resetPasswordForEmail: async () => ({ data: null, error: missingEnvError })
  },
  storage: {
    from() {
      throw missingEnvError;
    }
  },
  from() {
    throw missingEnvError;
  }
};

export const supabase = hasSupabaseEnv ? createClient(supabaseUrl, supabaseAnonKey) : fallbackClient;
export { hasSupabaseEnv };
