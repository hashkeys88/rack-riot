import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, ImagePlus, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CityAutocompleteInput from '../components/CityAutocompleteInput';
import {
  createStylistAccount,
  submitStylistQuestionnaire,
  uploadStylistApplicationPhoto,
  validateOnboardingEmail
} from '../lib/onboarding';

const initialForm = {
  name: '',
  email: '',
  city: '',
  yearsExperience: '',
  specialties: [],
  portfolio: '',
  photoFile: null,
  bio: '',
  availability: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false
};

const steps = [
  {
    eyebrow: 'Step 1',
    title: 'Tell us who you are',
    subtitle: 'Start with the basics so we know where you work and how to reach you.'
  },
  {
    eyebrow: 'Step 2',
    title: 'Share your styling background',
    subtitle: 'Help us understand your experience, taste, and the clients you serve best.'
  },
  {
    eyebrow: 'Step 3',
    title: 'Confirm your availability',
    subtitle: 'One last pass before we review your application.'
  }
];

const availabilityOptions = [
  'Weekdays',
  'Weekends',
  'Weekday evenings',
  'Flexible',
  'By appointment only'
];

const specialtyOptions = [
  'Everyday styling',
  'Event / occasion',
  'Wardrobe refresh',
  'Personal shopping',
  'Workwear / professional',
  'Editorial / creative',
  'Plus-size styling',
  'Menswear'
];

const inputClassName =
  'min-h-[54px] w-full rounded-[18px] border border-riotBorder bg-white px-4 py-3 text-[15px] font-medium text-riotText transition focus:border-riotAccent focus:outline-none focus:ring-4 focus:ring-riotAccent/10';

const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxPhotoSize = 5 * 1024 * 1024;

function FieldError({ show, message }) {
  if (!show || !message) return null;
  return <p className="mt-2 text-[13px] font-semibold text-riotError">{message}</p>;
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'RR';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function ProfilePhoto({ name, photoUrl, size = 'large' }) {
  const sizeClass = size === 'large' ? 'h-24 w-24 text-[30px]' : 'h-16 w-16 text-[20px]';
  const [imageFailed, setImageFailed] = useState(false);

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        alt={`${name || 'Stylist'} profile`}
        className={`${sizeClass} rounded-full border-4 border-white object-cover shadow-[0_18px_45px_rgba(0,0,0,0.16)]`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full border-4 border-white bg-[#0D1B2A] font-extrabold text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]`}>
      {getInitials(name)}
    </div>
  );
}

function normalizePortfolioUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function validatePhoto(file) {
  if (!file) return '';
  if (!allowedPhotoTypes.has(file.type)) return 'Please upload a JPG, PNG, or WebP photo.';
  if (file.size > maxPhotoSize) return 'Please keep the photo under 5 MB.';
  return '';
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  showError,
  placeholder,
  type = 'text',
  multiline = false,
  required = false
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[13px] font-bold text-riotText">
        {label}
        {required ? <span className="ml-1 text-riotAccent">*</span> : null}
      </span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={5}
          className={`${inputClassName} resize-none leading-7`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
      <FieldError show={showError} message={error} />
    </label>
  );
}

function PhotoUploadField({ name, file, previewUrl, error, onChange, onRemove }) {
  return (
    <div>
      <span className="mb-2 block text-[13px] font-bold text-riotText">Profile photo</span>
      <div className="rounded-[20px] border border-riotBorder bg-[#fcfcfc] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfilePhoto name={name} photoUrl={previewUrl} size="small" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-riotText">{file ? file.name : 'Add a real photo of yourself'}</p>
            <p className="mt-1 text-[13px] leading-6 text-riotTextSecondary">
              Optional, but helpful. Use a clear JPG, PNG, or WebP under 5 MB.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label
                htmlFor="stylist-photo"
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-riotText px-4 text-[13px] font-bold text-white transition hover:bg-black"
              >
                <ImagePlus className="mr-2" size={15} />
                {file ? 'Change photo' : 'Upload photo'}
              </label>
              {file ? (
                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-riotBorder px-4 text-[13px] font-bold text-riotText transition hover:border-riotText"
                >
                  <X className="mr-2" size={15} />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <input
          id="stylist-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
          className="sr-only"
        />
      </div>
      <FieldError show={Boolean(error)} message={error} />
    </div>
  );
}

function validateStep(form, stepIndex) {
  const errors = {};

  if (stepIndex === 0) {
    if (!form.name.trim()) errors.name = 'Please enter your full name.';
    const { valid, message } = validateOnboardingEmail(form.email);
    if (!valid) errors.email = message;
    if (!form.city.trim()) errors.city = 'Please enter your city.';
  }

  if (stepIndex === 1) {
    if (!form.yearsExperience.trim()) errors.yearsExperience = 'Please select your experience level.';
    if (!Array.isArray(form.specialties) || form.specialties.length === 0) errors.specialties = 'Please select at least one styling specialty.';
    if (!form.bio.trim() || form.bio.trim().length < 10) {
      errors.bio = 'Please add a short bio with at least 10 characters.';
    }
  }

  if (stepIndex === 2) {
    if (!form.availability.trim()) errors.availability = 'Please share your availability.';
    if (form.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
    if (!form.acceptedTerms) errors.acceptedTerms = 'Please accept the application terms.';
  }

  return errors;
}

export default function Apply() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submittedProfile, setSubmittedProfile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [touched, setTouched] = useState({});
  const [attemptedSteps, setAttemptedSteps] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [complete, setComplete] = useState(false);

  const currentStep = steps[stepIndex];
  const currentErrors = useMemo(() => validateStep(form, stepIndex), [form, stepIndex]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  function updateField(field, value) {
    setSubmitError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function updatePhoto(file) {
    setSubmitError('');
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);

    const error = validatePhoto(file);
    setPhotoError(error);
    setPhotoPreviewUrl(file && !error ? URL.createObjectURL(file) : '');
    setForm((current) => ({ ...current, photoFile: file && !error ? file : null }));
  }

  function removePhoto() {
    setSubmitError('');
    setPhotoError('');
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl('');
    setForm((current) => ({ ...current, photoFile: null }));
  }

  function toggleSpecialty(option) {
    setSubmitError('');
    setForm((current) => {
      const existing = Array.isArray(current.specialties) ? current.specialties : [];
      const specialties = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];

      return { ...current, specialties };
    });
  }

  function shouldShowError(field) {
    return Boolean(touched[field] || attemptedSteps[stepIndex]);
  }

  function handleNext() {
    const nextErrors = validateStep(form, stepIndex);
    setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));

    if (Object.keys(nextErrors).length) return;
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateStep(form, stepIndex);
    setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));
    setSubmitError('');

    if (Object.keys(nextErrors).length || photoError) return;

    const { normalizedEmail } = validateOnboardingEmail(form.email);
    const profile = {
      name: form.name.trim(),
      email: normalizedEmail,
      city: form.city.trim(),
      yearsExperience: form.yearsExperience.trim(),
      specialties: form.specialties,
      portfolio: normalizePortfolioUrl(form.portfolio),
      photoUrl: '',
      bio: form.bio.trim(),
      availability: form.availability.trim()
    };

    setSubmitting(true);
    try {
      const uploadedPhotoUrl = await uploadStylistApplicationPhoto({
        file: form.photoFile,
        email: profile.email
      });
      profile.photoUrl = uploadedPhotoUrl;

      const authData = await createStylistAccount({
        email: profile.email,
        password: form.password,
        name: profile.name,
        city: profile.city,
        yearsExperience: profile.yearsExperience,
        specialties: profile.specialties,
        portfolio: profile.portfolio,
        photoUrl: profile.photoUrl,
        bio: profile.bio,
        availability: profile.availability
      });

      await submitStylistQuestionnaire({
        name: profile.name,
        email: profile.email,
        city: profile.city,
        experience: profile.yearsExperience,
        specialties: profile.specialties,
        portfolio: profile.portfolio || undefined,
        photoUrl: profile.photoUrl || undefined,
        bio: profile.bio,
        availability: profile.availability,
        authUserId: authData.user.id
      });
      setSubmittedProfile({ ...profile, emailConfirmationRequired: !authData.session });
      setComplete(true);
    } catch (error) {
      setSubmitError(String(error?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <section className="min-h-[calc(100vh-72px)] bg-[#fbfbfb] px-6 py-10 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[32px] border border-riotBorder bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <aside className="rounded-[28px] bg-[#0D1B2A] p-7 text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-riotAccent">
                  <CheckCircle2 size={28} />
                </span>
                <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3b3]">Application submitted</p>
                <h1 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[42px]">
                  Your stylist profile preview
                </h1>
                <p className="mt-4 text-[15px] leading-7 text-[#b7c8d8]">
                  {submittedProfile?.emailConfirmationRequired
                    ? `${submittedProfile?.name?.split(/\s+/)[0]}, check your inbox at ${submittedProfile?.email}. Click the confirmation link in the email, then return here to log in.`
                    : `${submittedProfile?.name?.split(/\s+/)[0]}, your account is ready and your profile is under review. You can manage it from your dashboard while you wait.`}
                </p>
                <Link
                  to={submittedProfile?.emailConfirmationRequired ? '/login' : '/stylist-dashboard'}
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[15px] font-semibold text-white transition hover:bg-riotAccentHover"
                >
                  {submittedProfile?.emailConfirmationRequired ? 'Go to login' : 'Open your dashboard'}
                </Link>
              </aside>

              <article className="overflow-hidden rounded-[28px] border border-riotBorder bg-[#fcfcfc]">
                <div className="bg-[#fff1f1] px-6 pb-7 pt-8 md:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-4">
                      <ProfilePhoto name={submittedProfile?.name} photoUrl={submittedProfile?.photoUrl} />
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">Pending review</p>
                        <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.03em] text-riotText md:text-[40px]">
                          {submittedProfile?.name || 'Rack Riot Stylist'}
                        </h2>
                        <p className="mt-1 text-[15px] font-semibold text-riotTextSecondary">
                          {submittedProfile?.city || 'City'} · {submittedProfile?.yearsExperience || 'Experience added'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6 md:p-8">
                  <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary">Bio</h3>
                    <p className="mt-3 text-[16px] leading-8 text-riotText">{submittedProfile?.bio}</p>
                  </section>

                  <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary">Specialties</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(submittedProfile?.specialties || []).map((specialty) => (
                        <span key={specialty} className="rounded-full border border-riotBorder bg-white px-3 py-2 text-[13px] font-bold text-riotText">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-riotBorder bg-white p-5">
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary">Availability</p>
                      <p className="mt-2 text-[16px] font-bold text-riotText">{submittedProfile?.availability}</p>
                    </div>
                    <div className="rounded-[20px] border border-riotBorder bg-white p-5">
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary">Contact</p>
                      <p className="mt-2 break-all text-[16px] font-bold text-riotText">{submittedProfile?.email}</p>
                    </div>
                  </section>

                  {submittedProfile?.portfolio ? (
                    <a
                      href={submittedProfile.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[14px] font-bold text-riotAccent transition hover:text-riotAccentHover"
                    >
                      View portfolio
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <p className="text-[14px] leading-6 text-riotTextSecondary">
                      No portfolio link was added. You can send one later if we need more examples of your work.
                    </p>
                  )}
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
        <Link to="/stylists" className="inline-flex items-center gap-2 text-[14px] font-semibold text-riotTextSecondary transition hover:text-riotText">
          <ArrowLeft size={16} />
          Back to stylists
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <aside className="rounded-[28px] bg-[#0D1B2A] p-7 text-white shadow-[0_24px_80px_rgba(13,27,42,0.22)] lg:sticky lg:top-24">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3b3]">Stylist application</p>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[42px]">
              Apply to join Rack Riot
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#b7c8d8]">
              We are building a curated network of experienced stylists who care about taste, trust, and client experience.
            </p>
            <div className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                      index <= stepIndex ? 'bg-riotAccent text-white' : 'bg-white/10 text-[#b7c8d8]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`text-[14px] font-semibold ${index === stepIndex ? 'text-white' : 'text-[#b7c8d8]'}`}>{step.title}</span>
                </div>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-[28px] border border-riotBorder bg-white p-6 shadow-[0_18px_70px_rgba(0,0,0,0.07)] md:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">{currentStep.eyebrow}</p>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-[-0.03em] text-riotText md:text-[42px]">{currentStep.title}</h2>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-7 text-riotTextSecondary">{currentStep.subtitle}</p>

            <div className="mt-9 space-y-5">
              {stepIndex === 0 ? (
                <>
                  <TextField
                    id="stylist-name"
                    label="Full Name"
                    value={form.name}
                    onChange={(value) => updateField('name', value)}
                    onBlur={() => markTouched('name')}
                    error={currentErrors.name}
                    showError={shouldShowError('name')}
                    placeholder="Your full name"
                    required
                  />
                  <TextField
                    id="stylist-email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField('email', value)}
                    onBlur={() => markTouched('email')}
                    error={currentErrors.email}
                    showError={shouldShowError('email')}
                    placeholder="you@example.com"
                    required
                  />
                  <label htmlFor="stylist-city" className="block">
                    <span className="mb-2 block text-[13px] font-bold text-riotText">
                      City <span className="ml-1 text-riotAccent">*</span>
                    </span>
                    <CityAutocompleteInput
                      inputId="stylist-city"
                      value={form.city}
                      onChange={(value) => updateField('city', value)}
                      onBlur={() => markTouched('city')}
                      placeholder="San Francisco"
                      className={inputClassName}
                    />
                    <FieldError show={shouldShowError('city')} message={currentErrors.city} />
                  </label>
                </>
              ) : null}

              {stepIndex === 1 ? (
                <>
                  <label htmlFor="stylist-years" className="block">
                    <span className="mb-2 block text-[13px] font-bold text-riotText">
                      Years of experience <span className="ml-1 text-riotAccent">*</span>
                    </span>
                    <select
                      id="stylist-years"
                      value={form.yearsExperience}
                      onChange={(event) => updateField('yearsExperience', event.target.value)}
                      onBlur={() => markTouched('yearsExperience')}
                      className={inputClassName}
                    >
                      <option value="">Select experience level</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    <FieldError show={shouldShowError('yearsExperience')} message={currentErrors.yearsExperience} />
                  </label>
                  <fieldset>
                    <legend className="mb-2 block text-[13px] font-bold text-riotText">
                      Styling specialties <span className="ml-1 text-riotAccent">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {specialtyOptions.map((option) => {
                        const selected = form.specialties.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              toggleSpecialty(option);
                              markTouched('specialties');
                            }}
                            className={`min-h-[48px] rounded-[16px] border px-4 py-3 text-left text-[14px] font-semibold transition ${
                              selected
                                ? 'border-riotAccent bg-[#fff1f1] text-riotText'
                                : 'border-riotBorder bg-white text-riotTextSecondary hover:border-riotText hover:text-riotText'
                            }`}
                            aria-pressed={selected}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    <FieldError show={shouldShowError('specialties')} message={currentErrors.specialties} />
                  </fieldset>
                  <TextField
                    id="stylist-portfolio"
                    label="Portfolio / Instagram / Website"
                    value={form.portfolio}
                    onChange={(value) => updateField('portfolio', value)}
                    onBlur={() => markTouched('portfolio')}
                    placeholder="https://instagram.com/yourhandle"
                  />
                  <PhotoUploadField
                    name={form.name}
                    file={form.photoFile}
                    previewUrl={photoPreviewUrl}
                    error={photoError}
                    onChange={updatePhoto}
                    onRemove={removePhoto}
                  />
                  <TextField
                    id="stylist-bio"
                    label="Short bio"
                    value={form.bio}
                    onChange={(value) => updateField('bio', value)}
                    onBlur={() => markTouched('bio')}
                    error={currentErrors.bio}
                    showError={shouldShowError('bio')}
                    placeholder="At least 10 characters about your styling background."
                    multiline
                    required
                  />
                </>
              ) : null}

              {stepIndex === 2 ? (
                <>
                  <label htmlFor="stylist-availability" className="block">
                    <span className="mb-2 block text-[13px] font-bold text-riotText">
                      Availability <span className="ml-1 text-riotAccent">*</span>
                    </span>
                    <select
                      id="stylist-availability"
                      value={form.availability}
                      onChange={(event) => updateField('availability', event.target.value)}
                      onBlur={() => markTouched('availability')}
                      className={inputClassName}
                    >
                      <option value="">Select availability</option>
                      {availabilityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <FieldError show={shouldShowError('availability')} message={currentErrors.availability} />
                  </label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      id="stylist-password"
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(value) => updateField('password', value)}
                      onBlur={() => markTouched('password')}
                      error={currentErrors.password}
                      showError={shouldShowError('password')}
                      placeholder="At least 8 characters"
                      required
                    />
                    <TextField
                      id="stylist-confirm-password"
                      label="Confirm password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(value) => updateField('confirmPassword', value)}
                      onBlur={() => markTouched('confirmPassword')}
                      error={currentErrors.confirmPassword}
                      showError={shouldShowError('confirmPassword')}
                      placeholder="Repeat your password"
                      required
                    />
                  </div>
                  <label className="flex gap-3 rounded-[18px] border border-riotBorder bg-[#fcfcfc] p-4">
                    <input
                      type="checkbox"
                      checked={form.acceptedTerms}
                      onChange={(event) => updateField('acceptedTerms', event.target.checked)}
                      onBlur={() => markTouched('acceptedTerms')}
                      className="mt-1 h-4 w-4 rounded border-riotBorder accent-riotAccent"
                    />
                    <span>
                      <span className="block text-[14px] font-bold text-riotText">Accept Terms</span>
                      <span className="mt-1 block text-[13px] leading-6 text-riotTextSecondary">
                        I confirm the information in this application is accurate and understand Rack Riot may review my portfolio before approval.
                      </span>
                      <FieldError show={shouldShowError('acceptedTerms')} message={currentErrors.acceptedTerms} />
                    </span>
                  </label>
                  <div className="flex items-center gap-3 rounded-[18px] bg-[#fff1f1] p-4 text-[14px] leading-6 text-riotTextSecondary">
                    <ShieldCheck className="shrink-0 text-riotAccent" size={20} />
                    <span>Your account opens immediately. Your public stylist profile remains hidden until approved.</span>
                  </div>
                </>
              ) : null}
            </div>

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

              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover"
                >
                  Continue
                  <ArrowRight className="ml-2" size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="hidden h-12 items-center justify-center rounded-full bg-riotAccent px-7 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                  <ArrowRight className="ml-2" size={16} />
                </button>
              )}
            </div>

            {stepIndex === steps.length - 1 ? (
              <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-riotAccent px-6 text-[15px] font-bold text-white shadow-[0_18px_44px_rgba(255,77,77,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
