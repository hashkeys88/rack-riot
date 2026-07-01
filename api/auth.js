import { createClient } from '@supabase/supabase-js';

const serviceSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anonSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const roles = ['client', 'stylist', 'admin'];

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
      if (!email || !password || !role) return badRequest(res, 'email, password, and role are required');
      if (!roles.includes(role)) return badRequest(res, `role must be one of: ${roles.join(', ')}`);

      const { data: created, error: createError } = await serviceSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || null,
          city: city || null,
          role
        }
      });

      if (createError) throw createError;

      const userId = created.user?.id;
      if (!userId) throw new Error('Unable to create user');

      const { error: profileError } = await serviceSupabase.from('users').insert({
        id: userId,
        email,
        full_name: fullName || null,
        city: city || null,
        role,
        style_tags: Array.isArray(styleTags) ? styleTags : [],
        favorite_stores: Array.isArray(favoriteStores) ? favoriteStores : []
      });

      if (profileError) throw profileError;

      if (role === 'stylist') {
        const { error: stylistError } = await serviceSupabase.from('stylists').insert({
          id: userId,
          bio: bio || null,
          specialty_tags: Array.isArray(specialtyTags) ? specialtyTags : [],
          price_group: Number(priceGroup) || null,
          price_private: Number(pricePrivate) || null,
          available: true
        });

        if (stylistError) throw stylistError;
      }

      return res.status(201).json({ data: { id: userId, email, role } });
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
      const { error: stylistError } = await serviceSupabase
        .from('stylists')
        .update({ status: 'approved', available: true })
        .eq('id', userId);
      if (stylistError) throw stylistError;

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
      if (!email) return badRequest(res, 'email is required');

      const normalizedEmail = String(email).trim().toLowerCase();
      const [{ data: userRow, error: userError }, { data: applicationRow, error: applicationError }] = await Promise.all([
        serviceSupabase.from('users').select('id, role').eq('email', normalizedEmail).maybeSingle(),
        serviceSupabase
          .from('stylist_applications')
          .select('id, status')
          .eq('email', normalizedEmail)
          .eq('status', 'pending')
          .maybeSingle()
      ]);

      if (userError) throw userError;
      const missingApplicationTable =
        applicationError &&
        String(applicationError.message || '').toLowerCase().includes("could not find the table 'public.stylist_applications'");
      if (applicationError && !missingApplicationTable) throw applicationError;

      return res.status(200).json({
        data: {
          userExists: Boolean(userRow),
          role: userRow?.role || null,
          stylistUnderReview: missingApplicationTable ? false : Boolean(applicationRow)
        }
      });
    }

    return badRequest(res, 'Unsupported action');
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
