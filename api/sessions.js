import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const validSessionTypes = ['group', 'private', 'buddy'];
const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return badRequest(res, 'userId is required');

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`host_id.eq.${userId},stylist_id.eq.${userId}`)
        .order('date', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ data: data || [] });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  }

  if (req.method === 'POST') {
    const { stylistId, hostId, sessionType, date, time, groupSize, stores, totalPrice, inviteEmails = [] } = req.body || {};

    if (!stylistId || !hostId || !sessionType || !date || !time) {
      return badRequest(res, 'stylistId, hostId, sessionType, date, and time are required');
    }

    if (!validSessionTypes.includes(sessionType)) {
      return badRequest(res, `sessionType must be one of: ${validSessionTypes.join(', ')}`);
    }

    const groupSizeNumber = Number(groupSize || 1);
    if (Number.isNaN(groupSizeNumber) || groupSizeNumber < 1) {
      return badRequest(res, 'groupSize must be a positive number');
    }

    if (!Array.isArray(stores)) return badRequest(res, 'stores must be an array');
    if (!Array.isArray(inviteEmails)) return badRequest(res, 'inviteEmails must be an array');

    const safeInviteEmails = inviteEmails
      .map((email) => String(email).trim())
      .filter(Boolean)
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    try {
      const sessionPayload = {
        stylist_id: stylistId,
        host_id: hostId,
        session_type: sessionType,
        date,
        time,
        group_size: groupSizeNumber,
        stores,
        status: validStatuses[0],
        total_price: Number(totalPrice) || 0
      };

      const { data: createdSession, error: createError } = await supabase
        .from('sessions')
        .insert(sessionPayload)
        .select('*')
        .single();

      if (createError) throw createError;

      if (safeInviteEmails.length) {
        const members = safeInviteEmails.map((email) => ({
          session_id: createdSession.id,
          email,
          status: 'invited'
        }));

        const { error: membersError } = await supabase.from('session_members').insert(members);
        if (membersError) throw membersError;
      }

      return res.status(201).json({ data: createdSession });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
