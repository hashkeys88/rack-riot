import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../lib/accountRole';
import { supabase } from '../lib/supabase';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';

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
      <Card maxWidth={620} width="100%" padding={8}>
      <form onSubmit={submit}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Account security</p>
        <div className="mt-4"><Text type="display-2" as="h1">Set a new password</Text></div>
        <div className="mt-5 max-w-md"><Text type="large" as="p" color="secondary">
          Choose something memorable and unique to your Rack Riot account.
        </Text></div>

        <div className="mt-8 space-y-5">
          <TextInput type="password" label="Password" value={password} onChange={setPassword} isRequired size="lg" />
          <TextInput type="password" label="Confirm password" value={confirmation} onChange={setConfirmation} isRequired size="lg" />
        </div>

        {error ? <p className="mt-4 text-[14px] font-semibold text-riotError">{error}</p> : null}

        <div className="mt-8">
          <Button type="submit" label="Save and continue" variant="primary" size="lg" isLoading={saving} className="w-full" />
        </div>
      </form>
      </Card>
    </section>
  );
}
