import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { dashboardPathForRole, resolveAccountRole } from '../lib/accountRole';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

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
      const role = await resolveAccountRole(data.user);
      window.location.replace(dashboardPathForRole(role));
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
    setNotice(null);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (resetError) throw resetError;
      setNotice(`If an account exists for ${normalizedEmail}, you'll receive a password reset link shortly.`);
    } catch (e) {
      setError(String(e?.message || 'Could not send reset email'));
    } finally {
      setSendingReset(false);
    }
  }

  if (!authLoading && user && !loading) {
    if (!profile) {
      return (
        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f7f7]">
          <p className="text-[15px] font-semibold text-riotTextSecondary">Loading your dashboard...</p>
        </section>
      );
    }
    return <Navigate to={dashboardPathForRole(profile.role)} replace />;
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-6 py-12 md:py-20">
      <div className="mx-auto max-w-[460px] overflow-hidden rounded-[28px] border border-riotBorder bg-white shadow-[0_24px_80px_rgba(0,0,0,0.09)]">
        <div className="bg-[#0D1B2A] px-7 py-8 text-white md:px-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ff9c9c]">Welcome back</p>
          <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.03em] text-white">Log in to Rack Riot</h1>
          <p className="mt-2 text-[15px] leading-6 text-[#b7c8d8]">Access your profile and dashboard.</p>
        </div>

        <div className="space-y-4 p-7 md:p-10">
        <GoogleAuthButton onError={setError} />
        <div className="my-5 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-riotBorder" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-riotTextSecondary">or use email</span>
          <span className="h-px flex-1 bg-riotBorder" />
        </div>
        <input
          value={email}
          type="email"
          placeholder="Email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
            if (notice) setNotice(null);
          }}
          className="min-h-[54px] w-full rounded-[18px] border border-riotBorder bg-white px-4 py-3 text-[15px] font-medium text-riotText outline-none transition focus:border-riotAccent focus:ring-4 focus:ring-riotAccent/10"
        />

        <div className="flex overflow-hidden rounded-[18px] border border-riotBorder bg-white focus-within:border-riotAccent focus-within:ring-4 focus-within:ring-riotAccent/10">
          <input
            value={password}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            className="min-h-[54px] min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] font-medium text-riotText outline-none"
          />
          <button onClick={() => setShowPassword((prev) => !prev)} className="px-4 text-[13px] font-semibold text-riotTextSecondary transition hover:text-riotText">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button onClick={handleLogin} disabled={loading} className="min-h-[52px] w-full rounded-full bg-riotAccent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-riotAccentHover disabled:opacity-60">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <button onClick={handleReset} disabled={sendingReset} className="text-[14px] font-semibold text-riotAccent transition hover:underline disabled:opacity-60">
          {sendingReset ? 'Sending...' : 'Forgot password?'}
        </button>

        {error ? <p className="rounded-[14px] bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">{error}</p> : null}
        {notice ? <p role="status" className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium leading-5 text-emerald-800">{notice}</p> : null}
        <p className="pt-2 text-center text-[14px] text-riotTextSecondary">
          Don't have an account? <Link to="/signup/client" className="font-semibold text-riotAccent hover:underline">Get started</Link>
        </p>
        </div>
      </div>
    </section>
  );
}
