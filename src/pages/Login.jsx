import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { dashboardPathForRole, resolveAccountRole } from '../lib/accountRole';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleLogin(event) {
    event?.preventDefault();
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
    <section className="min-h-[calc(100vh-76px)] bg-atelier-paper px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
      <div className="mx-auto grid max-w-[1120px] overflow-hidden border border-atelier-ink/20 bg-atelier-paper lg:min-h-[660px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-atelier-forest p-12 text-atelier-paper lg:flex lg:flex-col lg:justify-between">
          <div className="atelier-grid absolute inset-0 opacity-10" />
          <p className="relative font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-citrus">Member access</p>
          <div className="relative">
            <p className="font-editorial text-[54px] font-semibold leading-[0.92] tracking-[-0.045em]">
              Pick up where
              <span className="block italic text-atelier-citrus">your style left off.</span>
            </p>
            <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/60">
              Your matches, applications, profile, and session details are waiting inside.
            </p>
          </div>
        </div>

        <div className="flex items-center p-7 sm:p-12 lg:p-16">
          <form onSubmit={handleLogin} className="w-full">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Welcome back</p>
            <h1 className="mt-4 text-[46px] font-semibold leading-none tracking-[-0.04em] text-atelier-ink">Log in</h1>
            <p className="mt-4 text-[15px] leading-7 text-atelier-muted">Use the email and password connected to your Rack Riot account.</p>

            <div className="space-y-5">
              <label htmlFor="login-email" className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-atelier-muted">Email</span>
                <input
                  id="login-email"
                  value={email}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                    if (notice) setNotice(null);
                  }}
                  className="min-h-[56px] w-full border border-atelier-ink/20 bg-atelier-paper px-4 text-[15px] outline-none transition focus:border-atelier-ink"
                />
              </label>

              <label htmlFor="login-password" className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-atelier-muted">Password</span>
                <div className="flex border border-atelier-ink/20 bg-atelier-paper focus-within:border-atelier-ink">
                  <input
                    id="login-password"
                    value={password}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError(null);
                    }}
                    className="min-h-[56px] min-w-0 flex-1 border-0 bg-transparent px-4 text-[15px] outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-atelier-muted hover:text-atelier-rust">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
            </div>

            {error ? <p role="alert" className="mt-5 border-l-2 border-riotError bg-red-50 px-4 py-3 text-[14px] font-semibold text-riotError">{error}</p> : null}
            {notice ? <p role="status" className="mt-5 border-l-2 border-riotSuccess bg-emerald-50 px-4 py-3 text-[14px] font-semibold leading-6 text-emerald-800">{notice}</p> : null}

            <button type="submit" disabled={loading} className="atelier-button atelier-button-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Logging in...' : 'Enter Rack Riot'}
            </button>

            <div className="mt-5 flex flex-col items-center justify-between gap-4 text-[13px] sm:flex-row">
              <button type="button" onClick={handleReset} disabled={sendingReset} className="font-bold text-atelier-rust transition hover:underline disabled:opacity-60">
                {sendingReset ? 'Sending reset link...' : 'Forgot password?'}
              </button>
              <p className="text-atelier-muted">
                New here? <Link to="/signup/client" className="font-bold text-atelier-ink underline decoration-atelier-rust underline-offset-4">Start a match</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
