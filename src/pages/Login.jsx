import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      if (signInError) {
        setError('Incorrect email or password');
        return;
      }

      if (!data?.user?.id) {
        setError('Something went wrong. Please try again.');
        return;
      }
      const hintedRole = data.user?.user_metadata?.role;
      if (hintedRole === 'stylist') {
        window.location.replace('/stylist-dashboard');
        return;
      }
      if (hintedRole === 'admin') {
        window.location.replace('/admin');
        return;
      }
      window.location.replace('/dashboard');
    } catch (e) {
      setError(String(e?.message || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setError('Enter your email first');
      return;
    }

    setSendingReset(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
      if (resetError) throw resetError;
      toast.success('Password reset email sent!');
    } catch (e) {
      setError(String(e?.message || 'Could not send reset email'));
    } finally {
      setSendingReset(false);
    }
  }

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-12">
      <div className="mx-auto max-w-[440px] rounded-xl border border-riotBorder bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <p className="font-logo text-[22px] text-riotAccent">Rack Riot</p>
        <h1 className="mt-3 text-[24px] font-bold">Log In</h1>
        <p className="mt-1 text-[14px] text-riotTextSecondary">Access your sessions and dashboard.</p>

        <div className="mt-6 space-y-4">
        <input
          value={email}
          type="email"
          placeholder="Email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2"
        />

        <div className="flex gap-2">
          <input
            value={password}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            className="flex-1 rounded-md border border-white/20 bg-black/40 px-3 py-2"
          />
          <button onClick={() => setShowPassword((prev) => !prev)} className="rounded-md border border-white/20 px-3 py-2 text-sm">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button onClick={handleLogin} disabled={loading} className="w-full rounded-md bg-riotAccent px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:opacity-60">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <button onClick={handleReset} disabled={sendingReset} className="text-[14px] text-riotAccent transition hover:underline disabled:opacity-60">
          {sendingReset ? 'Sending...' : 'Forgot password?'}
        </button>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
      <p className="mt-4 text-center text-[14px] text-riotTextSecondary">
        Don't have an account? <Link to="/signup" className="text-riotAccent">Get Started</Link>
      </p>
      </div>
    </section>
  );
}
