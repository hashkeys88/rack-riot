import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
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

    navigate('/stylist-dashboard', { replace: true });
  }

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fbfbfb] px-6 py-16">
      <form
        onSubmit={submit}
        className="mx-auto max-w-lg rounded-[28px] border border-riotBorder bg-white p-8 shadow-[0_18px_70px_rgba(0,0,0,0.07)]"
      >
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">Account setup</p>
        <h1 className="mt-3 text-[36px] font-extrabold tracking-[-0.03em] text-riotText">Create your password</h1>
        <p className="mt-3 text-[15px] leading-7 text-riotTextSecondary">
          Set the password you will use to access your Rack Riot stylist dashboard.
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
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-riotAccent px-7 text-[14px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Set password and continue'}
        </button>
      </form>
    </section>
  );
}
