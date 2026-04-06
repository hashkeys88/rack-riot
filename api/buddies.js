import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const validStatuses = ['pending', 'accepted', 'declined'];

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return badRequest(res, 'userId is required');

    try {
      const { data, error } = await supabase
        .from('buddy_matches')
        .select('id, user_a, user_b, match_score, status, created_at, user_a_profile:users!buddy_matches_user_a_fkey(full_name, avatar_url, city, style_tags, favorite_stores), user_b_profile:users!buddy_matches_user_b_fkey(full_name, avatar_url, city, style_tags, favorite_stores)')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data || []).map((row) => {
        const target = row.user_a === userId ? row.user_b_profile : row.user_a_profile;
        return {
          id: row.id,
          status: row.status,
          match_score: row.match_score,
          full_name: target?.full_name,
          avatar_url: target?.avatar_url,
          city: target?.city,
          style_tags: target?.style_tags || [],
          favorite_stores: target?.favorite_stores || []
        };
      });

      return res.status(200).json({ data: transformed });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  }

  if (req.method === 'POST') {
    const { userA, userB, matchScore = 50, status = 'pending' } = req.body || {};
    if (!userA || !userB) return badRequest(res, 'userA and userB are required');
    if (userA === userB) return badRequest(res, 'userA and userB cannot be the same');

    const numericMatch = Number(matchScore);
    if (Number.isNaN(numericMatch) || numericMatch < 0 || numericMatch > 100) {
      return badRequest(res, 'matchScore must be a number between 0 and 100');
    }

    if (!validStatuses.includes(status)) {
      return badRequest(res, `status must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const { data, error } = await supabase
        .from('buddy_matches')
        .insert({ user_a: userA, user_b: userB, match_score: numericMatch, status })
        .select('*')
        .single();

      if (error) throw error;
      return res.status(201).json({ data });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
