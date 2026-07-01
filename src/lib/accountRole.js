import { supabase } from './supabase';

export async function resolveAccountRole(user) {
  const metadataRole = user?.user_metadata?.role || 'client';
  if (!user?.id || metadataRole === 'admin') return metadataRole;

  const [{ data: userProfile }, { data: stylistProfile }] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('stylists').select('id').eq('id', user.id).maybeSingle()
  ]);

  if (userProfile?.role === 'admin') return 'admin';
  if (stylistProfile?.id) return 'stylist';
  return userProfile?.role || metadataRole;
}

export function dashboardPathForRole(role) {
  if (role === 'stylist') return '/stylist-dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}
