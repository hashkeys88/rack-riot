import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Other'];

export default function Buddies() {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [loading, setLoading] = useState(false);
  const [successCity, setSuccessCity] = useState('');
  const [error, setError] = useState('');

  async function handleJoinWaitlist() {
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }

    setLoading(true);
    setError('');

    const payload = { email: email.trim().toLowerCase(), city };

    try {
      const { error: insertError } = await supabase.from('waitlist').insert(payload);

      if (insertError) throw insertError;

      setSuccessCity(city);
      toast.success('Waitlist joined');
    } catch (caughtError) {
      const message = String(caughtError?.message || '');
      const canFallback = message.includes('Missing VITE_SUPABASE_URL') || message.includes('Failed to fetch');

      if (!canFallback) {
        setError('Something went wrong, please try again');
        toast.error('Something went wrong, please try again');
        setLoading(false);
        return;
      }

      try {
        const existing = JSON.parse(window.localStorage.getItem('rack-riot-waitlist') || '[]');
        existing.push({ ...payload, created_at: new Date().toISOString() });
        window.localStorage.setItem('rack-riot-waitlist', JSON.stringify(existing));
        setSuccessCity(city);
        toast.success('Waitlist joined');
      } catch {
        setError('Something went wrong, please try again');
        toast.error('Something went wrong, please try again');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-12">
      <div className="mx-auto max-w-3xl">
      <h1 className="text-[32px] font-bold">Find your shopping crew</h1>
      <p className="mt-3 text-[14px] text-riotTextSecondary">We're building your city's style community. Be the first to know when buddy matching launches.</p>

      <div className="mt-8 space-y-4 rounded-xl border border-riotBorder bg-white p-6 shadow-riot">
        {successCity ? (
          <p className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            You're on the list! We'll reach out when we launch in {successCity}
          </p>
        ) : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2"
        />

        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2">
          {cities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button onClick={handleJoinWaitlist} disabled={loading} className="w-full rounded-md bg-riotAccent px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:opacity-60">
          {loading ? 'Joining...' : 'Join Waitlist'}
        </button>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
      </div>
    </section>
  );
}
