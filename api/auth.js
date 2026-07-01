import { createClient } from '@supabase/supabase-js';

const serviceSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    action,
    email,
    password,
    role,
    fullName,
    city,
    styleTags = [],
    favoriteStores = [],
    bio,
    specialtyTags = [],
    priceGroup,
    pricePrivate,
    accessToken,
    applicationId,
    yearsExperience,
    availability,
    portfolio,
    photoUrl
  } = req.body || {};

  if (!action) return badRequest(res, 'action is required');

  try {
    if (action === 'signup') {
      return res.status(410).json({ error: 'Use the public Supabase signup flow.' });
    }

    if (action === 'login') {
      if (!email || !password) return badRequest(res, 'email and password are required');

      const { data, error } = await anonSupabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return res.status(200).json({ data });
    }

    if (action === 'logout') {
      if (!accessToken) return badRequest(res, 'accessToken is required for logout');
      const { error } = await serviceSupabase.auth.admin.signOut(accessToken);
      if (error) throw error;
      return res.status(200).json({ data: { success: true } });
    }

    if (action === 'approveStylist') {
      if (!applicationId) return badRequest(res, 'applicationId is required');

      const adminToken = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      const { data: authData, error: authError } = await serviceSupabase.auth.getUser(adminToken);
      if (authError || !authData.user) return res.status(401).json({ error: 'Unauthorized' });

      const { data: adminProfile, error: adminError } = await serviceSupabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (adminError || adminProfile?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { data: application, error: applicationLookupError } = await serviceSupabase
        .from('stylist_applications')
        .select('auth_user_id')
        .eq('id', applicationId)
        .maybeSingle();
      if (applicationLookupError) throw applicationLookupError;
      if (!application?.auth_user_id) {
        return badRequest(res, 'This legacy application is not linked to a stylist account.');
      }

      const userId = application.auth_user_id;
      const { data: approvedStylist, error: stylistError } = await serviceSupabase
        .from('stylists')
        .update({ status: 'approved', available: true })
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (stylistError) throw stylistError;
      if (!approvedStylist) {
        return res.status(409).json({ error: 'The stylist must confirm their email before approval.' });
      }

      const { error: applicationError } = await serviceSupabase
        .from('stylist_applications')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      if (applicationError) throw applicationError;

      return res.status(200).json({
        data: {
          userId,
          status: 'approved'
        }
      });
    }

    if (action === 'lookupLoginState') {
      return res.status(410).json({ error: 'Account lookup is no longer available.' });
    }

    return badRequest(res, 'Unsupported action');
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
