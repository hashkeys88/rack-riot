import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, tags, price } = req.query;
    let query = supabase
      .from('stylists')
      .select('id, bio, specialty_tags, price_group, price_private, rating, review_count, available, users!inner(full_name, avatar_url, city)')
      .eq('available', true);

    if (city) {
      query = query.ilike('users.city', `%${String(city).trim()}%`);
    }

    if (tags) {
      const parsedTags = String(tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (parsedTags.length) {
        query = query.overlaps('specialty_tags', parsedTags);
      }
    }

    if (price) {
      const maxPrice = Number(price);
      if (Number.isNaN(maxPrice) || maxPrice < 0) return badRequest(res, 'price must be a positive number');
      query = query.lte('price_group', maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;

    const stylists = (data || []).map((row) => ({
      id: row.id,
      bio: row.bio,
      specialty_tags: row.specialty_tags,
      price_group: row.price_group,
      price_private: row.price_private,
      rating: row.rating,
      review_count: row.review_count,
      available: row.available,
      full_name: row.users?.full_name,
      avatar_url: row.users?.avatar_url,
      city: row.users?.city
    }));

    return res.status(200).json({ data: stylists });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}
