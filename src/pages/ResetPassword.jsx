import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../lib/accountRole';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || 'Could not set your password.');
      return;
    }

    const role = profile?.role || user?.user_metadata?.role || 'client';
    navigate(dashboardPathForRole(role), { replace: true });
  }

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center font-mono text-[11px] uppercase tracking-[0.18em] text-atelier-muted">Preparing your account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="min-h-[calc(100vh-76px)] bg-atelier-paper px-6 py-12 sm:px-10 lg:py-20">
      <form
        onSubmit={submit}
        className="mx-auto max-w-[620px] border border-atelier-ink/20 bg-atelier-paper p-7 sm:p-12"
      >
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Account security</p>
        <h1 className="mt-4 text-[48px] font-semibold leading-none tracking-[-0.04em] text-riotText">Set a new password</h1>
        <p className="mt-5 max-w-md text-[15px] leading-7 text-riotTextSecondary">
          Choose something memorable and unique to your Rack Riot account.
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-riotText">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-[54px] w-full rounded-[18px] border border-riotBorder bg-white px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-riotText">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="min-h-[54px] w-full rounded-[18px] border border-riotBorder bg-white px-4 py-3"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-[14px] font-semibold text-riotError">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="atelier-button atelier-button-primary mt-8 w-full disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save and continue'}
        </button>
      </form>
    </section>
  );
}
