import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

const cities = ['SF', 'NYC', 'LA', 'Chicago', 'Austin', 'Other'];

async function withTimeout(task, timeoutMs = 25000, message = 'Request timed out. Please try again.') {
  let timer = null;
  try {
    return await Promise.race([
      task,
      new Promise((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
      })
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

function isTimeoutMessage(message) {
  return String(message || '').toLowerCase().includes('timed out');
}

export default function Apply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'SF',
    instagramHandle: '',
    bio: ''
  });
  const inFlightRef = useRef(false);
  const watchdogRef = useRef(null);

  const bioCount = useMemo(() => form.bio.length, [form.bio]);

  async function handleApply() {
    if (!form.fullName.trim()) {
      toast.error('Please enter full name');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Please enter email');
      return;
    }
    if (!form.password) {
      toast.error('Please enter password');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    inFlightRef.current = true;
    if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      if (!inFlightRef.current) return;
      setError('Request is taking too long. Please try again.');
      setLoading(false);
      inFlightRef.current = false;
    }, 15000);

    try {
      const email = form.email.toLowerCase().trim();

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      const { data, error: signUpError } = await withTimeout(
        supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            data: {
              role: 'stylist',
              full_name: form.fullName.trim()
            }
          }
        }),
        25000,
        'Signup timed out. Please retry.'
      );
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists.');
        } else {
          setError(signUpError.message);
        }
        return;
      }
      if (!data?.user) {
        setError('Signup failed. Please try again.');
        return;
      }

      const userId = data.user.id;

      const timestamp = new Date().toISOString();

      const { error: userError } = await withTimeout(
        supabase.from('users').upsert({
          id: userId,
          email,
          full_name: form.fullName.trim(),
          city: form.city,
          role: 'stylist',
          style_tags: [],
          favorite_stores: [],
          created_at: timestamp
        }),
        15000,
        'User profile setup timed out.'
      );
      if (userError) {
        console.error('User insert error:', userError);
      }

      const { error: stylistError } = await withTimeout(
        supabase.from('stylists').upsert({
          id: userId,
          bio: form.bio || '',
          specialty_tags: [],
          price_group: 150,
          price_private: 75,
          rating: 0,
          review_count: 0,
          available: true
        }),
        15000,
        'Stylist setup timed out.'
      );
      if (stylistError) {
        console.error('Stylist insert error:', stylistError);
      }

      const activeSession = data?.session;
      if (!activeSession) {
        const { error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password: form.password
          }),
          20000,
          'Sign-in timed out after account creation.'
        );
        if (signInError) {
          console.error('Stylist sign-in error:', signInError);
        }
      }

      setSuccess(true);
      toast.success('Stylist profile created');
      navigate('/stylist-dashboard', { replace: true });
    } catch (caughtError) {
      console.error('Apply error:', caughtError);
      const message = String(caughtError?.message || '');

      if (isTimeoutMessage(message)) {
        try {
          const email = form.email.toLowerCase().trim();
          const { data: signInData, error: signInError } = await withTimeout(
            supabase.auth.signInWithPassword({
              email,
              password: form.password
            }),
            20000,
            'Recovery sign-in timed out. Please retry.'
          );

          if (!signInError && signInData?.user?.id) {
            const userId = signInData.user.id;
            const timestamp = new Date().toISOString();

            await supabase.from('users').upsert({
              id: userId,
              email,
              full_name: form.fullName.trim(),
              city: form.city,
              role: 'stylist',
              style_tags: [],
              favorite_stores: [],
              created_at: timestamp
            });

            await supabase.from('stylists').upsert({
              id: userId,
              bio: form.bio || '',
              specialty_tags: [],
              price_group: 150,
              price_private: 75,
              rating: 0,
              review_count: 0,
              available: true
            });

            toast.success('Stylist profile created');
            navigate('/stylist-dashboard', { replace: true });
            return;
          }
        } catch (recoveryError) {
          console.error('Apply recovery error:', recoveryError);
        }
      }

      setError(message || 'Something went wrong. Please try again.');
      toast.error('Could not create stylist profile');
    } finally {
      if (watchdogRef.current) {
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-12">
      <div className="mx-auto max-w-3xl">
      <h1 className="text-[32px] font-bold">Become a Founding Stylist</h1>
      <p className="mt-3 text-[14px] text-riotTextSecondary">Join our founding stylist network and start earning doing what you love.</p>

      <div className="mt-8 space-y-4 rounded-xl border border-riotBorder bg-white p-6 shadow-riot">
        {success ? (
          <p className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            You're officially live as a stylist.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}{' '}
            {error.toLowerCase().includes('log in') || error.toLowerCase().includes('already exists') ? (
              <Link to="/login" className="text-riotAccent underline">
                Log in instead
              </Link>
            ) : null}
          </p>
        ) : null}

        <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
        <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
        <input value={form.password} type="password" onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
        <input value={form.confirmPassword} type="password" onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm password" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />

        <select value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2">
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <input value={form.instagramHandle} onChange={(e) => setForm((p) => ({ ...p, instagramHandle: e.target.value }))} placeholder="Instagram handle" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />

        <div>
          <textarea
            value={form.bio}
            maxLength={300}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Short bio"
            className="min-h-28 w-full rounded-md border border-white/20 bg-black/40 px-3 py-2"
          />
          <p className="mt-1 text-right text-xs text-riotText/60">{bioCount}/300</p>
        </div>

        <button onClick={handleApply} disabled={loading} className="w-full rounded-md bg-riotAccent px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:opacity-60">
          {loading ? 'Creating your profile...' : 'Join as a Founding Stylist'}
        </button>
      </div>
      </div>
    </section>
  );
}
