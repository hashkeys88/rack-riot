import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const adminEmail = process.env.STYLIST_APPLICATION_ADMIN_EMAIL || 'rajanagp@gmail.com';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'Stylist application notifications are not configured' });
  }

  const authUserId = String(req.body?.authUserId || '');
  if (!authUserId) {
    return res.status(400).json({ error: 'authUserId is required' });
  }

  try {
    const { data: application, error: lookupError } = await supabase
      .from('stylist_applications')
      .select('id, full_name, email, city, years_experience, specialties, portfolio, status, admin_notified_at')
      .eq('auth_user_id', authUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!application) {
      return res.status(404).json({ error: 'Stylist application not found' });
    }
    if (application.admin_notified_at) {
      return res.status(200).json({ data: { sent: false, alreadyNotified: true } });
    }

    const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const reviewUrl = `${siteUrl.replace(/\/$/, '')}/admin`;
    const specialties = Array.isArray(application.specialties) ? application.specialties.join(', ') : 'Not provided';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'RackRiot <auth@updates.rackriot.app>',
        to: [adminEmail],
        subject: `New stylist application: ${application.full_name}`,
        html: `
          <div style="background:#f6f4f2;padding:40px 20px;font-family:Arial,sans-serif;color:#0f0f0f">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px">
              <p style="margin:0 0 18px;color:#ff4d4d;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">RackRiot</p>
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2">New stylist application</h1>
              <p style="margin:0 0 28px;color:#666;line-height:1.6">A new stylist is ready for review.</p>
              <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5">
                <tr><td style="padding:8px 0;color:#777">Name</td><td style="padding:8px 0;font-weight:700">${escapeHtml(application.full_name)}</td></tr>
                <tr><td style="padding:8px 0;color:#777">Email</td><td style="padding:8px 0;font-weight:700">${escapeHtml(application.email)}</td></tr>
                <tr><td style="padding:8px 0;color:#777">City</td><td style="padding:8px 0;font-weight:700">${escapeHtml(application.city)}</td></tr>
                <tr><td style="padding:8px 0;color:#777">Experience</td><td style="padding:8px 0;font-weight:700">${escapeHtml(application.years_experience)}</td></tr>
                <tr><td style="padding:8px 0;color:#777">Specialties</td><td style="padding:8px 0;font-weight:700">${escapeHtml(specialties)}</td></tr>
              </table>
              <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;margin-top:28px;border-radius:999px;background:#ff4d4d;padding:14px 24px;color:#fff;font-weight:700;text-decoration:none">Review application</a>
            </div>
          </div>
        `
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      throw new Error(`Resend rejected the notification: ${resendError}`);
    }

    const { error: updateError } = await supabase
      .from('stylist_applications')
      .update({ admin_notified_at: new Date().toISOString() })
      .eq('id', application.id);
    if (updateError) throw updateError;

    return res.status(200).json({ data: { sent: true } });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to send admin notification' });
  }
}
