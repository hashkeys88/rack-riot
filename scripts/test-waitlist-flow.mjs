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

const email = `codex-smoke-${Date.now()}@gmail.com`;

async function cleanup() {
  const { error } = await adminClient.from('waitlist').delete().eq('email', email);
  if (error) throw error;
}

async function insertPublic(payload) {
  return publicClient.from('waitlist').insert(payload);
}

async function main() {
  await cleanup();

  const clientInsert = await insertPublic({
    email,
    name: 'Codex Client',
    city: 'San Francisco',
    experience: null,
    years_experience: null,
    portfolio: null,
    type: 'client',
    status: 'pending'
  });
  if (clientInsert.error) throw new Error(`client insert failed: ${clientInsert.error.message}`);

  const stylistInsert = await insertPublic({
    email,
    name: 'Codex Stylist',
    city: 'San Francisco',
    experience: 'Personal styling background',
    years_experience: '1–3 years',
    portfolio: null,
    type: 'stylist',
    status: 'pending'
  });
  if (stylistInsert.error) throw new Error(`stylist insert failed: ${stylistInsert.error.message}`);

  const duplicateClient = await insertPublic({
    email,
    name: 'Duplicate Client',
    city: 'San Francisco',
    experience: null,
    years_experience: null,
    portfolio: null,
    type: 'client',
    status: 'pending'
  });
  if (!duplicateClient.error) {
    throw new Error('duplicate client insert unexpectedly succeeded');
  }

  const { data, error } = await adminClient
    .from('waitlist')
    .select('email,type,status,name,city,years_experience,portfolio,experience')
    .eq('email', email)
    .order('type', { ascending: true });

  if (error) throw error;

  if (!Array.isArray(data) || data.length !== 2) {
    throw new Error(`expected 2 rows for smoke test email, got ${data?.length ?? 0}`);
  }

  console.log('Smoke test passed');
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
