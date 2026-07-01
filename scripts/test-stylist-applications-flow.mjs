import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const email = `codex-stylist-app-${Date.now()}@gmail.com`;
const photoPath = `codex/${Date.now()}-profile.png`;
const photoBucket = 'stylist-application-photos';

async function cleanup() {
  const { error } = await adminClient.from('stylist_applications').delete().eq('email', email);
  if (error) throw error;
  await adminClient.storage.from(photoBucket).remove([photoPath]);
}

async function uploadPublicPhoto() {
  const onePixelPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64'
  );

  const { error } = await publicClient.storage.from(photoBucket).upload(photoPath, onePixelPng, {
    contentType: 'image/png',
    upsert: false
  });

  if (error) throw new Error(`stylist photo upload failed: ${error.message}`);

  const { data } = publicClient.storage.from(photoBucket).getPublicUrl(photoPath);
  if (!data?.publicUrl) throw new Error('expected public URL for uploaded stylist photo');

  return data.publicUrl;
}

async function insertPublic(photoUrl, overrides = {}) {
  return publicClient.from('stylist_applications').insert({
    email,
    full_name: 'Codex Stylist Applicant',
    city: 'San Francisco',
    years_experience: '3-5 years',
    specialties: ['Everyday styling', 'Personal shopping'],
    portfolio: 'https://instagram.com/codexstylist',
    photo_url: photoUrl,
    bio: 'Experienced stylist focused on practical, wearable wardrobes.',
    availability: 'Weekends',
    status: 'pending',
    ...overrides
  });
}

async function main() {
  await cleanup();

  const photoUrl = await uploadPublicPhoto();
  const insert = await insertPublic(photoUrl);
  if (insert.error) throw new Error(`stylist application insert failed: ${insert.error.message}`);

  const duplicate = await insertPublic(photoUrl, { full_name: 'Duplicate Applicant' });
  if (!duplicate.error) {
    throw new Error('duplicate stylist application insert unexpectedly succeeded');
  }

  const { data, error } = await adminClient
    .from('stylist_applications')
    .select('email,full_name,city,years_experience,specialties,portfolio,photo_url,bio,availability,status')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('expected stylist application row, got none');
  if (!Array.isArray(data.specialties) || data.specialties.length !== 2) {
    throw new Error('expected specialties array to be stored');
  }
  if (data.photo_url !== photoUrl) {
    throw new Error('expected uploaded profile photo URL to be stored');
  }

  console.log('Stylist application smoke test passed');
  console.log(JSON.stringify(data, null, 2));

  await cleanup();
}

main().catch(async (error) => {
  try {
    await cleanup();
  } catch {}
  console.error(error.message || error);
  process.exit(1);
});
