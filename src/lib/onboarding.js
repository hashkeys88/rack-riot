import { supabase } from './supabase';

const TRUSTED_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'fastmail.com'
]);

const BLOCKED_EMAIL_DOMAINS = new Set([
  'gmal.com',
  'gmial.com',
  'gmail.comp',
  'gmail.con',
  'gmail.coom',
  'gmail.cm',
  'pm.com',
  'hotnail.com',
  'hotmai.com',
  'hotmail.con',
  'yaho.com',
  'yahoo.con',
  'outlok.com',
  'outlook.con',
  'pmail.com',
  'test.com',
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'yopmail.com'
]);

function isValidEmail(email) {
  if (!email || email.trim() === '') return false;
  if (email.startsWith('.') || email.startsWith('@')) return false;
  if (email.includes('..')) return false;
  if (email.indexOf('@') !== email.lastIndexOf('@')) return false;
  const [local, domain] = email.split('@');
  if (!local || !domain) return false;
  if (domain.startsWith('.')) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validateOnboardingEmail(rawEmail) {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const [, domain = ''] = normalizedEmail.split('@');

  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, normalizedEmail, message: 'Please enter a valid email address.' };
  }

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, normalizedEmail, message: 'Please enter a valid email address.' };
  }

  if (!TRUSTED_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, normalizedEmail, message: 'Please use a well-known email provider.' };
  }

  return { valid: true, normalizedEmail, message: '' };
}

export async function submitClientQuestionnaire({ email, city, intentType, sessionType }) {
  const { error } = await supabase.from('waitlist').insert({
    email,
    city,
    intent_type: intentType,
    session_type: sessionType,
    type: 'client',
    status: 'pending'
  });

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      throw new Error("You're already on the client waitlist.");
    }
    throw error;
  }
}

export async function submitStylistQuestionnaire({
  email,
  city,
  services,
  experience,
  availability,
  workStyle,
  portfolio
}) {
  const details = [
    services?.length ? `Services: ${services.join(', ')}` : null,
    workStyle ? `Work style: ${workStyle}` : null,
    availability ? `Availability: ${availability}` : null
  ]
    .filter(Boolean)
    .join(' | ');

  const { error } = await supabase.from('waitlist').insert({
    email,
    city,
    experience: details || null,
    years_experience: experience || null,
    portfolio: portfolio || null,
    type: 'stylist',
    status: 'pending'
  });

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      throw new Error("You've already applied as a stylist.");
    }
    throw error;
  }
}
