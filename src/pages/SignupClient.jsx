import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import CityAutocompleteInput from '../components/CityAutocompleteInput';
import {
  createClientAccount,
  submitClientQuestionnaire,
  validateOnboardingEmail
} from '../lib/onboarding';

const choiceSteps = [
  {
    id: 'outfitNeeds',
    eyebrow: 'Step 1',
    title: 'What do you want help with?',
    subtitle: 'We’ll use this to understand the kind of styling support you want first.',
    options: [
      { value: 'everyday', label: 'Everyday outfits' },
      { value: 'event', label: 'Event / occasion' },
      { value: 'wardrobe', label: 'Wardrobe refresh' }
    ]
  },
  {
    id: 'shoppingPreference',
    eyebrow: 'Step 2',
    title: 'How do you want to shop?',
    subtitle: 'Choose the format that feels easiest for you.',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'group', label: 'With friends' },
      { value: 'buddy', label: 'With one friend' }
    ]
  }
];

const allSteps = [
  ...choiceSteps.map((step) => ({ title: step.title })),
  { title: 'Where should we match you?' }
];

const answerLabels = Object.fromEntries(
  choiceSteps.flatMap((step) => step.options.map((option) => [`${step.id}:${option.value}`, option.label]))
);

const inputClassName =
  'min-h-[54px] w-full rounded-[18px] border border-riotBorder bg-white px-4 py-3 text-[15px] font-medium text-riotText transition focus:border-riotAccent focus:outline-none focus:ring-4 focus:ring-riotAccent/10';

function OptionCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center justify-between rounded-[18px] border px-5 py-4 text-left transition ${
        selected
          ? 'border-riotText bg-[#fffafa] shadow-[0_12px_30px_rgba(0,0,0,0.07)]'
          : 'border-riotBorder bg-white hover:border-riotText'
      }`}
      aria-pressed={selected}
    >
      <span className="pr-4 text-[16px] font-bold leading-6 text-riotText">{label}</span>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-riotText' : 'border-riotBorderDark'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-riotText' : 'bg-transparent'}`} />
      </span>
    </button>
  );
}

function getAnswerLabel(stepId, value) {
  return answerLabels[`${stepId}:${value}`] || value || 'Not selected';
}

export default function SignupClient() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fields, setFields] = useState({ name: '', city: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedMatch, setSubmittedMatch] = useState(null);

  const isContactStep = stepIndex === choiceSteps.length;
  const currentStep = isContactStep ? null : choiceSteps[stepIndex];
  const currentAnswer = currentStep ? answers[currentStep.id] : '';
  const emailValidation = useMemo(
    () => validateOnboardingEmail(fields.email || ''),
    [fields.email]
  );
  const cityError = !fields.city.trim() ? 'Please enter your city.' : '';
  const nameError = fields.name.trim().length < 2 ? 'Please enter your full name.' : '';
  const emailError = !emailValidation.valid ? emailValidation.message : '';
  const passwordError =
    fields.password.length < 8 ? 'Use at least 8 characters.' : '';
  const confirmPasswordError =
    fields.confirmPassword !== fields.password ? 'Passwords do not match.' : '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex, submittedMatch]);

  function selectOption(value) {
    setSubmitError('');
    setAnswers((current) => ({ ...current, [currentStep.id]: value }));
  }

  function continueFlow() {
    if (!currentAnswer) return;
    setStepIndex((current) => Math.min(current + 1, allSteps.length - 1));
  }

  async function submitMatch(event) {
    event.preventDefault();
    setAttemptedSubmit(true);
    setSubmitError('');

    if (nameError || cityError || emailError || passwordError || confirmPasswordError) return;

    const match = {
      ...answers,
      name: fields.name.trim(),
      city: fields.city.trim(),
      email: emailValidation.normalizedEmail
    };

    setSubmitting(true);
    try {
      const authData = await createClientAccount({
        email: match.email,
        password: fields.password,
        name: match.name,
        city: match.city,
        outfitNeeds: match.outfitNeeds,
        shoppingPreference: match.shoppingPreference
      });
      await submitClientQuestionnaire({
        email: match.email,
        city: match.city,
        intentType: match.outfitNeeds,
        sessionType: match.shoppingPreference
      });
      setSubmittedMatch({ ...match, emailConfirmationRequired: !authData.session });
    } catch (error) {
      setSubmitError(String(error?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedMatch) {
    return (
      <section className="min-h-[calc(100vh-72px)] bg-[#fbfbfb] px-6 py-10 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[32px] border border-riotBorder bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <aside className="rounded-[28px] bg-[#0D1B2A] p-7 text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-riotAccent">
                  <CheckCircle2 size={28} />
                </span>
                <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3b3]">Match started</p>
                <h1 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[42px]">
                  Your styling brief is ready
                </h1>
                <p className="mt-4 text-[15px] leading-7 text-[#b7c8d8]">
                  We’ll use this brief to look for the right stylist and shopping format in your city.
                </p>
                <Link
                  to="/login"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[15px] font-semibold text-white transition hover:bg-riotAccentHover"
                >
                  Log in
                </Link>
              </aside>

              <article className="overflow-hidden rounded-[28px] border border-riotBorder bg-[#fcfcfc]">
                <div className="bg-[#fff1f1] px-6 py-8 md:px-8">
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">Pending match</p>
                  <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.03em] text-riotText md:text-[40px]">
                    Styling support in {submittedMatch.city}
                  </h2>
                  <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold text-riotTextSecondary">
                    <MapPin size={16} className="text-riotAccent" />
                    {submittedMatch.city}
                  </p>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 md:p-8">
                  {[
                    ['What you need', getAnswerLabel('outfitNeeds', submittedMatch.outfitNeeds)],
                    ['Session format', getAnswerLabel('shoppingPreference', submittedMatch.shoppingPreference)]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[20px] border border-riotBorder bg-white p-5">
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary">{label}</p>
                      <p className="mt-2 text-[16px] font-bold leading-6 text-riotText">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mx-6 mb-6 flex items-center gap-3 rounded-[18px] bg-[#fff1f1] p-4 text-[14px] leading-6 text-riotTextSecondary md:mx-8 md:mb-8">
                  <ShieldCheck className="shrink-0 text-riotAccent" size={20} />
                  <span>
                    {submittedMatch.emailConfirmationRequired
                      ? `${submittedMatch.name.split(/\s+/)[0]}, check ${submittedMatch.email} to confirm your account.`
                      : `${submittedMatch.name.split(/\s+/)[0]}, your account is ready.`}
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fbfbfb] px-6 py-10 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-riotTextSecondary transition hover:text-riotText">
          <ArrowLeft size={16} />
          Back to homepage
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <aside className="hidden rounded-[28px] bg-[#0D1B2A] p-7 text-white shadow-[0_24px_80px_rgba(13,27,42,0.22)] lg:sticky lg:top-24 lg:block">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3b3]">Stylist matching</p>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[42px]">
              Find your styling fit
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#b7c8d8]">
              Tell us what you need, how you like to shop, and where you are. We’ll turn it into a clear match brief.
            </p>
            <div className="mt-8 space-y-3">
              {allSteps.map((step, index) => (
                <div key={step.title} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                      index <= stepIndex ? 'bg-riotAccent text-white' : 'bg-white/10 text-[#b7c8d8]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`text-[14px] font-semibold ${index === stepIndex ? 'text-white' : 'text-[#b7c8d8]'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <form onSubmit={submitMatch} className="rounded-[28px] border border-riotBorder bg-white p-6 shadow-[0_18px_70px_rgba(0,0,0,0.07)] md:p-8">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.16em]">
                <span className="text-riotAccent">Stylist matching</span>
                <span className="text-riotTextSecondary">Step {stepIndex + 1} of {allSteps.length}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-riotBorder">
                <div
                  className="h-full rounded-full bg-riotAccent transition-[width] duration-300"
                  style={{ width: `${((stepIndex + 1) / allSteps.length) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">
              {isContactStep ? `Step ${allSteps.length}` : currentStep.eyebrow}
            </p>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-[-0.03em] text-riotText md:text-[42px]">
              {isContactStep ? 'Where should we match you?' : currentStep.title}
            </h2>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-7 text-riotTextSecondary">
              {isContactStep
                ? 'Tell us where you are and how to reach you when there’s a strong fit.'
                : currentStep.subtitle}
            </p>

            {!isContactStep ? (
              <div className="mt-9 grid gap-3">
                {currentStep.options.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={currentAnswer === option.value}
                    onClick={() => selectOption(option.value)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-9 space-y-5">
                <label htmlFor="client-name" className="block">
                  <span className="mb-2 block text-[13px] font-bold text-riotText">
                    Full name <span className="ml-1 text-riotAccent">*</span>
                  </span>
                  <input
                    id="client-name"
                    type="text"
                    autoComplete="name"
                    value={fields.name}
                    onChange={(event) => {
                      setSubmitError('');
                      setFields((current) => ({ ...current, name: event.target.value }));
                    }}
                    onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                    placeholder="Your full name"
                    className={inputClassName}
                  />
                  {(touched.name || attemptedSubmit) && nameError ? (
                    <p className="mt-2 text-[13px] font-semibold text-riotError">{nameError}</p>
                  ) : null}
                </label>

                <label htmlFor="client-city" className="block">
                  <span className="mb-2 block text-[13px] font-bold text-riotText">
                    City <span className="ml-1 text-riotAccent">*</span>
                  </span>
                  <CityAutocompleteInput
                    inputId="client-city"
                    value={fields.city}
                    onChange={(value) => {
                      setSubmitError('');
                      setFields((current) => ({ ...current, city: value }));
                    }}
                    onBlur={() => setTouched((current) => ({ ...current, city: true }))}
                    placeholder="San Francisco"
                    className={inputClassName}
                  />
                  {(touched.city || attemptedSubmit) && cityError ? (
                    <p className="mt-2 text-[13px] font-semibold text-riotError">{cityError}</p>
                  ) : null}
                </label>

                <label htmlFor="client-email" className="block">
                  <span className="mb-2 block text-[13px] font-bold text-riotText">
                    Email <span className="ml-1 text-riotAccent">*</span>
                  </span>
                  <input
                    id="client-email"
                    type="email"
                    value={fields.email}
                    onChange={(event) => {
                      setSubmitError('');
                      setFields((current) => ({ ...current, email: event.target.value }));
                    }}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    placeholder="you@example.com"
                    className={inputClassName}
                  />
                  {(touched.email || attemptedSubmit) && emailError ? (
                    <p className="mt-2 text-[13px] font-semibold text-riotError">{emailError}</p>
                  ) : null}
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label htmlFor="client-password" className="block">
                    <span className="mb-2 block text-[13px] font-bold text-riotText">
                      Password <span className="ml-1 text-riotAccent">*</span>
                    </span>
                    <input
                      id="client-password"
                      type="password"
                      autoComplete="new-password"
                      value={fields.password}
                      onChange={(event) => {
                        setSubmitError('');
                        setFields((current) => ({ ...current, password: event.target.value }));
                      }}
                      onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                      placeholder="At least 8 characters"
                      className={inputClassName}
                    />
                    {(touched.password || attemptedSubmit) && passwordError ? (
                      <p className="mt-2 text-[13px] font-semibold text-riotError">{passwordError}</p>
                    ) : null}
                  </label>

                  <label htmlFor="client-confirm-password" className="block">
                    <span className="mb-2 block text-[13px] font-bold text-riotText">
                      Confirm password <span className="ml-1 text-riotAccent">*</span>
                    </span>
                    <input
                      id="client-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={fields.confirmPassword}
                      onChange={(event) => {
                        setSubmitError('');
                        setFields((current) => ({ ...current, confirmPassword: event.target.value }));
                      }}
                      onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                      placeholder="Repeat your password"
                      className={inputClassName}
                    />
                    {(touched.confirmPassword || attemptedSubmit) && confirmPasswordError ? (
                      <p className="mt-2 text-[13px] font-semibold text-riotError">{confirmPasswordError}</p>
                    ) : null}
                  </label>
                </div>

                <div className="flex items-center gap-3 rounded-[18px] bg-[#fff1f1] p-4 text-[14px] leading-6 text-riotTextSecondary">
                  <ShieldCheck className="shrink-0 text-riotAccent" size={20} />
                  <span>Your password secures your Rack Riot account. Your answers create your private match brief.</span>
                </div>
              </div>
            )}

            {submitError ? <p className="mt-5 text-[14px] font-semibold text-riotError">{submitError}</p> : null}

            <div className="mt-9 flex items-center justify-between gap-4">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-riotBorder px-6 text-[14px] font-semibold text-riotText transition hover:border-riotText"
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              {!isContactStep ? (
                <button
                  type="button"
                  disabled={!currentAnswer}
                  onClick={continueFlow}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2" size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Creating your account...' : 'Create account'}
                  <ArrowRight className="ml-2" size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
