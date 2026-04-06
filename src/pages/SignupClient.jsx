import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import StepIndicator from '../components/StepIndicator';
import TagPill from '../components/TagPill';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const cityOptions = ['San Jose', 'San Francisco', 'NYC', 'LA', 'Chicago', 'Austin', 'Other'];
const styleTagOptions = ['thrift', 'vintage', 'streetwear', 'y2k', 'minimalist', 'cottagecore', 'preppy', 'grunge', 'smart casual'];
const storeOptions = ['Goodwill', 'Buffalo Exchange', 'Crossroads', 'Thrift Town', 'Community Thrift', 'Wasteland', 'Urban Outfitters', 'Zara', 'ASOS', 'Depop'];

function strengthForPassword(value) {
  if (!value) return { label: '', tone: '' };
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (score <= 1) return { label: 'Weak', tone: 'text-red-300' };
  if (score === 2) return { label: 'Medium', tone: 'text-amber-200' };
  return { label: 'Strong', tone: 'text-emerald-300' };
}

async function withTimeout(task, timeoutMs = 20000) {
  let timer = null;
  try {
    return await Promise.race([
      task,
      new Promise((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('Network timeout while creating account. Please retry.')), timeoutMs);
      })
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

async function withRetry(taskFactory, retries = 1, delayMs = 700) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await taskFactory();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => window.setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

function TogglePills({ options, selected, onToggle, max }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        const blocked = !active && selected.length >= max;
        return (
          <TagPill
            key={option}
            label={option}
            selected={active}
            onClick={blocked ? undefined : () => onToggle(option)}
          />
        );
      })}
    </div>
  );
}

export default function SignupClient() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'San Jose',
    styleTags: [],
    favoriteStores: []
  });

  const passwordStrength = useMemo(() => strengthForPassword(formData.password), [formData.password]);
  const trimmedName = formData.name.trim();
  const trimmedEmail = formData.email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const passwordValid = formData.password.length >= 8;
  const showConfirmError = (touched.confirmPassword || attemptedNext) && Boolean(formData.confirmPassword || attemptedNext);
  const passwordMismatch = showConfirmError && formData.password !== formData.confirmPassword;
  const stepOneValid =
    Boolean(trimmedName) &&
    emailValid &&
    passwordValid &&
    Boolean(formData.confirmPassword) &&
    formData.password === formData.confirmPassword;

  function inputClasses(hasError = false) {
    return `w-full rounded-md border bg-white px-3 py-2 text-riotText placeholder:text-riotTextMuted transition focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-riotBorder focus:border-riotAccent focus:ring-riotAccent/10'
    }`;
  }

  function toggleStyleTag(tag) {
    setFormData((prev) => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag) ? prev.styleTags.filter((item) => item !== tag) : [...prev.styleTags, tag]
    }));
  }

  function toggleFavoriteStore(store) {
    setFormData((prev) => ({
      ...prev,
      favoriteStores: prev.favoriteStores.includes(store) ? prev.favoriteStores.filter((item) => item !== store) : [...prev.favoriteStores, store]
    }));
  }

  function canContinueStepOne() {
    if (!trimmedName) {
      setError('Please enter your first name');
      return false;
    }
    if (!trimmedEmail) {
      setError('Please enter your email');
      return false;
    }
    if (!emailValid) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (passwordMismatch) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  }

  function nextStep() {
    setError(null);
    if (step === 1) {
      setAttemptedNext(true);
      if (!canContinueStepOne()) return;
    }
    setStep((prev) => Math.min(3, prev + 1));
  }

  function previousStep() {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  }

  async function handleSignup() {
    setLoading(true);
    setError(null);

    try {
      if (!hasSupabaseEnv) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      }

      const email = formData.email.toLowerCase().trim();

      const { data, error } = await withRetry(
        () =>
          withTimeout(
            supabase.auth.signUp({
              email,
              password: formData.password,
              options: {
                data: {
                  role: 'client',
                  full_name: formData.name.trim()
                }
              }
            }),
            30000
          ),
        1,
        800
      );
      if (error) throw error;
      if (!data?.user?.id) throw new Error('Could not create account. Please try again.');

      const { error: insertError } = await withRetry(
        () =>
          withTimeout(
            supabase.from('users').upsert(
              {
                id: data.user.id,
                email,
                full_name: formData.name.trim(),
                city: formData.city,
                role: 'client',
                style_tags: formData.styleTags || [],
                favorite_stores: formData.favoriteStores || []
              },
              { onConflict: 'id' }
            ),
            25000
          ),
        1,
        600
      );
      if (insertError) throw insertError;

      let activeSession = data?.session || null;
      if (!activeSession) {
        const { data: signedIn, error: signInError } = await withRetry(
          () =>
            withTimeout(
              supabase.auth.signInWithPassword({
                email,
                password: formData.password
              }),
              20000
            ),
          1,
          700
        );

        if (signInError) {
          const signInMessage = String(signInError.message || '');
          if (signInMessage.toLowerCase().includes('email not confirmed')) {
            throw new Error('Account created. Please confirm your email, then log in.');
          }
          throw signInError;
        }
        activeSession = signedIn?.session || null;
      }

      if (!activeSession) {
        throw new Error('Account created but session is not ready. Please log in.');
      }

      navigate('/dashboard', { replace: true });
    } catch (e) {
      const message = String(e?.message || '');
      if (
        message.includes('already registered') ||
        message.toLowerCase().includes('user already registered') ||
        message.toLowerCase().includes('email address is already registered')
      ) {
        setError('An account with this email already exists.');
      } else if (message.toLowerCase().includes('duplicate key value')) {
        setError('An account with this email already exists.');
      } else {
        setError(message || 'Something went wrong.');
      }
      toast.error(message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-12">
      <div className="mx-auto max-w-3xl">
      <h1 className="text-[32px] font-bold">Client Sign Up</h1>
      <p className="mt-2 text-[14px] text-riotTextSecondary">Create your account and start booking sessions.</p>

      <div className="mt-8 rounded-xl border border-riotBorder bg-white p-6 shadow-riot">
        <StepIndicator step={step} total={3} />

        {step === 1 ? (
          <div className="mt-4 space-y-5">
            <p className="text-lg font-semibold">Step 1: Account Details</p>

            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-sm font-medium text-riotText">
                First Name
              </label>
              <input
                id="signup-name"
                value={formData.name}
                placeholder="Raj"
                autoComplete="given-name"
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                className={inputClasses()}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-sm font-medium text-riotText">
                Email
              </label>
              <input
                id="signup-email"
                value={formData.email}
                type="email"
                placeholder="raj@gmail.com"
                autoComplete="email"
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }));
                  if (error) setError(null);
                }}
                className={inputClasses(touched.email && trimmedEmail && !emailValid)}
              />
              {touched.email && trimmedEmail && !emailValid ? <p className="text-xs text-red-300">Please enter a valid email</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-sm font-medium text-riotText">
                Password
              </label>
              <input
                id="signup-password"
                value={formData.password}
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                className={inputClasses(touched.password && formData.password && !passwordValid)}
              />
              <p className="text-xs text-riotTextSecondary">Use at least 8 characters.</p>
              {formData.password ? <p className={`text-xs ${passwordStrength.tone}`}>Password strength: {passwordStrength.label}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-riotText">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                value={formData.confirmPassword}
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                onChange={(event) => setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className={inputClasses(passwordMismatch)}
              />
              {passwordMismatch ? <p className="text-xs text-red-300">Passwords do not match</p> : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 space-y-5">
            <p className="text-lg font-semibold">Step 2: Your Style</p>
            <select value={formData.city} onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2">
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div>
              <p className="mb-2 text-sm text-riotText/80">Style tags (up to 5)</p>
              <TogglePills options={styleTagOptions} selected={formData.styleTags} onToggle={toggleStyleTag} max={5} />
            </div>
            <div>
              <p className="mb-2 text-sm text-riotText/80">Favorite stores (up to 5)</p>
              <TogglePills options={storeOptions} selected={formData.favoriteStores} onToggle={toggleFavoriteStore} max={5} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 space-y-3">
            <p className="text-lg font-semibold">Step 3: Confirm</p>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-riotText/90">
              <p>Name: {formData.name || '-'}</p>
              <p>Email: {formData.email || '-'}</p>
              <p>City: {formData.city || '-'}</p>
              <p>Style tags: {formData.styleTags.join(', ') || '-'}</p>
              <p>Favorite stores: {formData.favoriteStores.join(', ') || '-'}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
            {error}{' '}
            {String(error).toLowerCase().includes('log in') ? (
              <Link to="/login" className="text-riotAccent underline">
                Log in
              </Link>
            ) : null}
          </p>
        ) : null}

        <div className="mt-8 flex justify-end gap-3">
          {step > 1 ? (
            <button onClick={previousStep} disabled={loading} className="rounded-md border border-riotBorder px-4 py-2 text-[14px] font-semibold text-riotText disabled:opacity-40">
              Back
            </button>
          ) : null}
          {step < 3 ? (
            <button onClick={nextStep} disabled={step === 1 ? !stepOneValid || loading : loading} className="rounded-md bg-riotAccent px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:cursor-not-allowed disabled:opacity-60">
              Next
            </button>
          ) : (
            <button onClick={handleSignup} disabled={loading} className="rounded-md bg-riotAccent px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
