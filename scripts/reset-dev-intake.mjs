import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function clearTable(tableName) {
  const { error } = await supabase.from(tableName).delete().not('id', 'is', null);
  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (message.includes('could not find the table') || message.includes('schema cache')) {
      return;
    }
    throw new Error(`${tableName}: ${error.message}`);
  }
}

async function main() {
  await clearTable('waitlist');
  await clearTable('stylist_applications');
  console.log('Cleared waitlist and stylist_applications in dev.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
