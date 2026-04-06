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
    rateExpectation,
    instagramHandle
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
      if (!email) return badRequest(res, 'email is required to create auth user');

      const temporaryPassword = `RackRiot!${Math.random().toString(36).slice(2, 10)}9A`;
      const normalizedEmail = String(email).trim().toLowerCase();

      const { data: created, error: createError } = await serviceSupabase.auth.admin.createUser({
        email: normalizedEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || null,
          city: city || null,
          role: 'stylist'
        }
      });
      if (createError) throw createError;

      const userId = created.user?.id;
      if (!userId) throw new Error('Unable to create stylist auth user');

      const parsedRate = typeof rateExpectation === 'string' ? rateExpectation.match(/[0-9]+/) : null;
      const baseRate = parsedRate ? Number(parsedRate[0]) : null;

      const { error: usersError } = await serviceSupabase.from('users').upsert({
        id: userId,
        email: normalizedEmail,
        full_name: fullName || null,
        city: city || null,
        role: 'stylist',
        style_tags: Array.isArray(specialtyTags) ? specialtyTags : []
      });
      if (usersError) throw usersError;

      const { error: stylistError } = await serviceSupabase.from('stylists').upsert({
        id: userId,
        bio: bio || null,
        specialty_tags: Array.isArray(specialtyTags) ? specialtyTags : [],
        price_group: baseRate ? baseRate * 2 : null,
        price_private: baseRate,
        status: 'approved',
        available: true
      });
      if (stylistError) throw stylistError;

      const { error: applicationError } = await serviceSupabase
        .from('stylist_applications')
        .update({ status: 'approved', email: normalizedEmail, instagram_handle: instagramHandle || null })
        .eq('id', applicationId);
      if (applicationError) throw applicationError;

      return res.status(200).json({ data: { userId, temporaryPassword } });
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
