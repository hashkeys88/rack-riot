import { supabase } from './supabase';

const STYLIST_PHOTO_BUCKET = 'stylist-application-photos';
const CLIENT_PHOTO_BUCKET = 'client-profile-photos';

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

export async function createClientAccount({
  email,
  password,
  name,
  city,
  outfitNeeds,
  shoppingPreference,
  avatarUrl
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: name,
        city,
        role: 'client',
        avatar_url: avatarUrl || null,
        match_brief: {
          outfit_needs: outfitNeeds,
          shopping_preference: shoppingPreference
        }
      }
    }
  });

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (message.includes('already registered') || message.includes('already exists')) {
      throw new Error('An account already exists for this email. Please log in instead.');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('We could not create your account. Please try again.');
  }

  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('An account already exists for this email. Please log in instead.');
  }

  return data;
}

export async function createStylistAccount({
  email,
  password,
  name,
  city,
  yearsExperience,
  specialties,
  portfolio,
  photoUrl,
  bio,
  availability
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: name,
        city,
        role: 'stylist',
        avatar_url: photoUrl || null,
        years_experience: yearsExperience,
        specialties,
        portfolio: portfolio || null,
        bio,
        availability
      }
    }
  });

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (message.includes('already registered') || message.includes('already exists')) {
      throw new Error('An account already exists for this email. Please log in instead.');
    }
    throw error;
  }

  if (!data.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0)) {
    throw new Error('An account already exists for this email. Please log in instead.');
  }

  return data;
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
      return;
    }
    throw error;
  }
}

export async function submitStylistQuestionnaire({
  name,
  email,
  city,
  experience,
  availability,
  portfolio,
  photoUrl,
  specialties,
  bio,
  authUserId
}) {
  const { error } = await supabase.from('stylist_applications').insert({
    email,
    full_name: name,
    city,
    years_experience: experience,
    specialties: Array.isArray(specialties) ? specialties : String(specialties || '').split(',').map((item) => item.trim()).filter(Boolean),
    portfolio: portfolio || null,
    photo_url: photoUrl || null,
    bio,
    availability,
    auth_user_id: authUserId,
    status: 'pending'
  });

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      throw new Error("You've already applied as a stylist.");
    }
    throw error;
  }

  try {
    const response = await fetch('/api/notify-stylist-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId })
    });
    if (!response.ok) {
      console.warn('Stylist application saved, but the admin notification could not be sent.');
    }
  } catch {
    console.warn('Stylist application saved, but the admin notification could not be sent.');
  }
}

function getPhotoExtension(file) {
  const mimeExtension = String(file?.type || '').split('/')[1];
  if (mimeExtension === 'jpeg') return 'jpg';
  if (mimeExtension) return mimeExtension;

  const nameExtension = String(file?.name || '').split('.').pop();
  return nameExtension || 'jpg';
}

function getPhotoPath(email, file) {
  const safeEmail = String(email || 'stylist')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${safeEmail}/${uniqueId}.${getPhotoExtension(file)}`;
}

export async function uploadStylistApplicationPhoto({ file, email }) {
  if (!file) return '';
  if (!supabase.storage) {
    throw new Error('Photo uploads need Supabase Storage configuration.');
  }

  const path = getPhotoPath(email, file);
  const { error } = await supabase.storage
    .from(STYLIST_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg',
      upsert: false
    });

  if (error) {
    throw new Error('Could not upload your profile photo. Please try again or submit without a photo.');
  }

  const { data } = supabase.storage.from(STYLIST_PHOTO_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}

export async function uploadClientProfilePhoto({ file, email }) {
  if (!file) return '';

  const path = getPhotoPath(email, file);
  const { error } = await supabase.storage
    .from(CLIENT_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg',
      upsert: false
    });

  if (error) {
    throw new Error('Could not upload your photo. Please try again or continue without it.');
  }

  const { data } = supabase.storage.from(CLIENT_PHOTO_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}
