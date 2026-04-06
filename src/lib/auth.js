import { supabase } from './supabase';

export async function signUpWithEmail(payload) {
  try {
    const { email, password, fullName, city, role, avatarUrl, styleTags = [], bio, specialtyTags = [], priceGroup, pricePrivate } = payload;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          city,
          role,
          avatar_url: avatarUrl || null
        }
      }
    });

    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) return data;

    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      email,
      full_name: fullName,
      role,
      city,
      style_tags: styleTags
    });
    if (profileError) throw profileError;

    if (role === 'stylist') {
      const { error: stylistError } = await supabase.from('stylists').insert({
        id: userId,
        bio: bio || null,
        specialty_tags: specialtyTags,
        price_group: Number(priceGroup) || null,
        price_private: Number(pricePrivate) || null
      });
      if (stylistError) throw stylistError;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function loginWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw error;
  }
}
