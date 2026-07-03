import { createContext, useContext, useEffect, useState } from 'react';
import { resolveAccountRole } from '../lib/accountRole';
import { hasSupabaseEnv, supabase } from '../lib/supabase';

const AuthContext = createContext({});
const AUTH_STORAGE_KEY_SUFFIX = '-auth-token';

function clearSupabaseStoredAuth() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('sb-') && key.endsWith(AUTH_STORAGE_KEY_SUFFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // no-op
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, fallback = {}) => {
    const fallbackRole = fallback?.role || 'client';
    const fallbackEmail = fallback?.email || null;
    const fallbackName = fallback?.full_name || 'Rack Riot User';

    try {
      const [{ data, error }, resolvedRole] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        resolveAccountRole({
          id: userId,
          user_metadata: { role: fallbackRole }
        })
      ]);
      if (error) throw error;
      setProfile(
        data
          ? { ...data, role: resolvedRole }
          : {
              id: userId,
              role: resolvedRole,
              email: fallbackEmail,
              full_name: fallbackName
            }
      );
      return true;
    } catch {
      setProfile({
        id: userId,
        role: fallbackRole,
        email: fallbackEmail,
        full_name: fallbackName
      });
      return false;
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfile(user.id, {
      role: user?.user_metadata?.role || 'client',
      email: user?.email?.toLowerCase?.() || null,
      full_name: user?.user_metadata?.full_name || user?.email?.split?.('@')?.[0] || 'Rack Riot User'
    });
  };

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseEnv) {
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      return () => {};
    }

    const initAuth = async () => {
      try {
        const {
          data: { session: nextSession }
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);

        if (nextSession?.user) {
          fetchProfile(nextSession.user.id, {
            role: nextSession.user?.user_metadata?.role || 'client',
            email: nextSession.user?.email?.toLowerCase?.() || null,
            full_name:
              nextSession.user?.user_metadata?.full_name ||
              nextSession.user?.email?.split?.('@')?.[0] ||
              'Rack Riot User'
          });
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Auth init error:', error);
        clearSupabaseStoredAuth();
        setUser(null);
        setSession(null);
        setProfile(null);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        fetchProfile(nextSession.user.id, {
          role: nextSession.user?.user_metadata?.role || 'client',
          email: nextSession.user?.email?.toLowerCase?.() || null,
          full_name:
            nextSession.user?.user_metadata?.full_name ||
            nextSession.user?.email?.split?.('@')?.[0] ||
            'Rack Riot User'
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = () => {
    const signOutRequest = supabase.auth.signOut({ scope: 'local' });
    clearSupabaseStoredAuth();
    setUser(null);
    setSession(null);
    setProfile(null);
    window.location.replace('/');
    signOutRequest.catch((error) => console.error('Background sign out failed:', error));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        logout,
        refreshProfile,
        isClient: profile?.role === 'client',
        isStylist: profile?.role === 'stylist',
        isAdmin: profile?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
