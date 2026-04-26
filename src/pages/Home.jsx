import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import heroShoppingImage from '../assets/vitaly-gariev-AixitSFNrBc-unsplash.jpg';

const WAITLIST_MODAL_EVENT = 'rack-riot:open-waitlist';
const TRUSTED_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'fastmail.com'
]);

const BLOCKED_EMAIL_DOMAINS = new Set([
  'gmal.com',
  'gmial.com',
  'gmail.comp',
  'gmail.con',
  'gmail.coom',
  'gmail.cm',
  'pm.com',
  'hotnail.com',
  'hotmai.com',
  'hotmail.con',
  'yaho.com',
  'yahoo.con',
  'outlok.com',
  'outlook.con',
  'pmail.com',
  'test.com',
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'yopmail.com'
]);

function isValidEmail(email) {
  if (!email || email.trim() === '') return false;
  if (email.startsWith('.') || email.startsWith('@')) return false;
  if (email.includes('..')) return false;
  if (email.indexOf('@') !== email.lastIndexOf('@')) return false;
  const [local, domain] = email.split('@');
  if (!local || !domain) return false;
  if (domain.startsWith('.')) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function validateWaitlistEmail(rawEmail) {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const [, domain = ''] = normalizedEmail.split('@');

  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, normalizedEmail, message: 'Please enter a valid email address' };
  }

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, normalizedEmail, message: 'Please enter a valid email address' };
  }

  if (!TRUSTED_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, normalizedEmail, message: 'Please use a well-known email provider' };
  }

  return { valid: true, normalizedEmail, message: '' };
}

const options = [
  {
    id: '01',
    title: 'Solo Session',
    description:
      'One-on-one support tailored to your style and budget.'
  },
  {
    id: '02',
    title: 'Group Session',
    description:
      'Bring friends and shop together with expert styling support built into the experience.'
  },
  {
    id: '03',
    title: 'Find a Shopping Buddy',
    description:
      'Get matched with shoppers in your city who share your style, goals, or vibe.'
  }
];

const processSteps = [
  {
    title: 'Choose your session',
    description: 'Pick solo, group, or get matched.'
  },
  {
    title: 'Tell us what you’re looking for',
    description: 'Share what kind of help you want so we can match you with the right experience.'
  },
  {
    title: 'Quick virtual intro',
    description: 'You’ll meet your stylist online first to align on goals and vibe.'
  },
  {
    title: 'Meet in store',
    description: 'Shop confidently and leave with better looks.'
  }
];

const yearsExperienceOptions = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];

const initialForm = {
  name: '',
  email: '',
  city: '',
  experience: '',
  portfolio: '',
  yearsExperience: ''
};

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function CityAutocompleteInput({ value, onChange, inputId, placeholder = 'City' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const query = value.trim();

    if (!MAPBOX_ACCESS_TOKEN || query.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const cachedSuggestions = cacheRef.current.get(query.toLowerCase());
    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          autocomplete: 'true',
          types: 'place',
          limit: '5'
        });

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch city suggestions');
        }

        const data = await response.json();
        const nextSuggestions = (data.features || [])
          .filter((feature) => Array.isArray(feature.place_type) && feature.place_type.includes('place'))
          .map((feature) => feature.place_name)
          .filter(Boolean);

        cacheRef.current.set(query.toLowerCase(), nextSuggestions);
        setSuggestions(nextSuggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  function handleSelect(city) {
    onChange(city);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          window.setTimeout(() => setShowSuggestions(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 pr-16 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
      />

      {loading ? (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5d5d5d]">
          Loading...
        </span>
      ) : null}

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-hidden rounded-[24px] border border-[#1B2D42] bg-[#0D1B2A] shadow-[0_18px_40px_rgba(13,27,42,0.22)]">
          {suggestions.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(city)}
              className="block w-full px-4 py-3 text-left text-[14px] font-medium text-white transition hover:bg-red-500"
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldLabel({ htmlFor, label, required = false }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-[#161616]">
      {label}
      {required ? <span className="ml-1 text-[#ff4d4d]">*</span> : null}
    </label>
  );
}

function WaitlistModal({
  modalType,
  modalStep,
  formData,
  fieldErrors,
  submitting,
  waitlistError,
  successMessage,
  onClose,
  onChange,
  onNextStep,
  onPreviousStep,
  onSubmit
}) {
  const isStylist = modalType === 'stylist';
  const titleId = isStylist ? 'stylist-modal-title' : 'client-modal-title';
  const descriptionId = isStylist ? 'stylist-modal-description' : 'client-modal-description';
  const submitTrustCopy = isStylist
    ? 'Your application stays private and is only used to review fit and contact you.'
    : 'We’ll only use your info for launch updates. No spam.';
  const isStylistIntroStep = isStylist && modalStep === 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[rgba(6,14,22,0.56)] backdrop-blur-[7px] transition-opacity duration-300" />
      <div
        className={`relative w-full rounded-[28px] border border-[#1f1f1f]/10 bg-white shadow-[0_38px_120px_rgba(12,22,34,0.32)] transition-all duration-300 ease-out animate-[modal-enter_220ms_ease-out] ${isStylist ? 'max-w-2xl' : 'max-w-xl'} ${isStylist ? 'max-h-[85vh] overflow-y-auto' : ''} p-6 md:p-7`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">Founding members</p>
            <h2 id={titleId} className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#161616]">
              {isStylist ? 'Apply as a stylist' : 'Get early access'}
            </h2>
            <p id={descriptionId} className="mt-3 text-[15px] leading-relaxed text-[#5d5d5d]">
              {isStylist ? 'Tell us about your styling background and where you want to launch.' : 'Be first to hear when Rack Riot opens in your city.'}
            </p>
            {isStylist ? <p className="mt-2 text-[13px] font-medium text-[#7a7a7a]">Step {modalStep} of 2</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#1f1f1f]/10 p-2 text-[#5d5d5d] transition hover:bg-[#fff4f1]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[20px] border border-[#1f1f1f]/8 bg-[#fffaf6] px-5 py-5 text-center">
            <p className="text-[15px] font-medium text-[#161616]">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {!isStylist || isStylistIntroStep ? (
              <>
                <div>
                  <FieldLabel htmlFor={`${modalType}-name`} label="Full name" required />
                  <input
                    id={`${modalType}-name`}
                    type="text"
                    value={formData.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
                  />
                  {fieldErrors.name ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.name}</p> : null}
                </div>

                <div>
                  <FieldLabel htmlFor={`${modalType}-email`} label="Email address" required />
                  <input
                    id={`${modalType}-email`}
                    type="email"
                    value={formData.email}
                    onChange={(event) => onChange('email', event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
                  />
                  {fieldErrors.email ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.email}</p> : null}
                </div>

                <div>
                  <FieldLabel htmlFor={`${modalType}-city`} label={isStylist ? 'City / service area' : 'City'} required />
                  <CityAutocompleteInput value={formData.city} onChange={(value) => onChange('city', value)} inputId={`${modalType}-city`} placeholder={isStylist ? 'Where do you style clients?' : 'Where should we keep you posted?'} />
                  {fieldErrors.city ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.city}</p> : null}
                </div>
              </>
            ) : null}

            {isStylist && modalStep === 2 ? (
              <>
                <div>
                  <FieldLabel htmlFor="stylist-portfolio" label="Instagram / portfolio" />
                  <input
                    id="stylist-portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={(event) => onChange('portfolio', event.target.value)}
                    placeholder="Instagram profile, website, or portfolio link"
                    className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
                  />
                  {fieldErrors.portfolio ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.portfolio}</p> : null}
                </div>

                <div>
                  <FieldLabel htmlFor="stylist-years" label="Years of styling experience" required />
                  <select
                    id="stylist-years"
                    value={formData.yearsExperience}
                    onChange={(event) => onChange('yearsExperience', event.target.value)}
                    className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
                  >
                    <option value="">Select experience level</option>
                    {yearsExperienceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.yearsExperience ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.yearsExperience}</p> : null}
                </div>

                <div>
                  <FieldLabel htmlFor="stylist-experience" label="Styling experience" required />
                  <textarea
                    id="stylist-experience"
                    value={formData.experience}
                    onChange={(event) => onChange('experience', event.target.value)}
                    placeholder="Tell us about your styling experience, the types of clients you’ve worked with, your style strengths, and what kinds of looks you love creating."
                    rows={4}
                    className="w-full rounded-[24px] border border-[#1f1f1f]/12 bg-[#fffaf6] px-5 py-3 text-[14px] font-medium text-[#161616] placeholder:text-[#9c9c9c] focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
                  />
                  {fieldErrors.experience ? <p className="mt-1 text-[13px] font-medium text-[#FF4D4D]">{fieldErrors.experience}</p> : null}
                </div>
              </>
            ) : null}

            {waitlistError ? <p className="text-[13px] font-medium text-[#d24747]">{waitlistError}</p> : null}
            <div className="pt-2">
              {isStylist ? (
                <div className="sticky bottom-0 space-y-3 bg-white pt-1">
                  <div className="flex gap-3">
                    {modalStep === 2 ? (
                      <button
                        type="button"
                        onClick={onPreviousStep}
                        className="inline-flex items-center justify-center rounded-full border border-[#1f1f1f]/12 px-5 py-3 text-[14px] font-semibold text-[#161616] transition hover:bg-[#fff4f1]"
                      >
                        Back
                      </button>
                    ) : null}
                    <button
                      type={modalStep === 1 ? 'button' : 'submit'}
                      onClick={modalStep === 1 ? onNextStep : undefined}
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#ff4d4d] px-5 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? 'Saving...' : modalStep === 1 ? 'Continue' : 'Apply to Join'}
                    </button>
                  </div>
                  <p className="text-center text-[14px] leading-relaxed text-[#6f6f6f]">{submitTrustCopy}</p>
                  <div className="flex items-center justify-center gap-2 text-[14px] text-[#7a7a7a]">
                    <LockKeyhole size={14} />
                    <span>Your info is handled securely</span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#ff4d4d] px-5 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? 'Saving...' : 'Count me in'}
                  </button>
                  <p className="mt-3 text-center text-[12px] leading-relaxed text-[#7a7a7a]">{submitTrustCopy}</p>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[14px] text-[#7a7a7a]">
                    <LockKeyhole size={14} />
                    <span>Your info is handled securely</span>
                  </div>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [modalType, setModalType] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!modalType) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [modalType]);

  useEffect(() => {
    function handleOpenWaitlist(event) {
      const nextType = event?.detail?.type === 'stylist' ? 'stylist' : 'client';
      setFormData(initialForm);
      setFieldErrors({});
      setWaitlistError('');
      setSuccessMessage('');
      setModalStep(1);
      setModalType(nextType);
    }

    window.addEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
    return () => window.removeEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
  }, []);

  function openWaitlistModal(type) {
    setFormData(initialForm);
    setFieldErrors({});
    setWaitlistError('');
    setSuccessMessage('');
    setModalStep(1);
    setModalType(type);
  }

  function closeWaitlistModal() {
    if (submitting) return;
    setModalType(null);
  }

  function updateField(field, value) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleStylistStepAdvance() {
    const nextFieldErrors = {};
    const normalizedName = formData.name.trim();
    const { valid: emailValid, message: emailValidationMessage } = validateWaitlistEmail(formData.email);
    const normalizedCity = formData.city.trim();

    if (!normalizedName) nextFieldErrors.name = 'Please enter your full name.';
    if (!emailValid) nextFieldErrors.email = emailValidationMessage;
    if (!normalizedCity) nextFieldErrors.city = 'Please enter your city.';

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setModalStep(2);
  }

  function scrollToHowItWorks() {
    const target = document.getElementById('how-it-works');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleWaitlistSubmit(event) {
    event.preventDefault();

    const { valid: emailValid, normalizedEmail, message: emailValidationMessage } = validateWaitlistEmail(formData.email);
    const normalizedName = formData.name.trim();
    const normalizedCity = formData.city.trim();
    const normalizedExperience = formData.experience.trim();
    const normalizedYearsExperience = formData.yearsExperience.trim();
    const isStylist = modalType === 'stylist';
    const nextFieldErrors = {};

    if (isStylist && modalStep === 1) {
      handleStylistStepAdvance();
      return;
    }

    if (!emailValid) {
      nextFieldErrors.email = emailValidationMessage;
    }

    if (!normalizedName) {
      nextFieldErrors.name = 'Please enter your full name.';
    }

    if (!normalizedCity) {
      nextFieldErrors.city = 'Please enter your city.';
    }

    if (isStylist && !normalizedYearsExperience) {
      nextFieldErrors.yearsExperience = 'Please select your experience level.';
    }

    if (isStylist && !normalizedExperience) {
      nextFieldErrors.experience = 'Please tell us about your styling background.';
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setWaitlistError('');

    try {
      if (isStylist) {
        const portfolio = formData.portfolio.trim();
        const { error } = await supabase.from('waitlist').insert({
          email: normalizedEmail,
          name: normalizedName || null,
          city: normalizedCity || null,
          experience: normalizedExperience || null,
          years_experience: normalizedYearsExperience || null,
          portfolio: portfolio || null,
          type: 'stylist',
          status: 'pending'
        });

        if (error) {
          const message = String(error.message || '').toLowerCase();
          if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
            setWaitlistError("You've already applied as a stylist!");
            return;
          }
          throw error;
        }
      } else {
        const payload = {
          email: normalizedEmail,
          name: normalizedName || null,
          city: normalizedCity || null,
          experience: null,
          years_experience: null,
          portfolio: null,
          type: 'client',
          status: 'pending'
        };

        const { error } = await supabase.from('waitlist').insert(payload);

        if (error) {
          const message = String(error.message || '').toLowerCase();
          if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
            setWaitlistError("You're already on the client waitlist!");
            return;
          }
          throw error;
        }
      }

      setSuccessMessage(
        isStylist
          ? 'Application received — we’ll review and follow up soon.'
          : 'You’re in — we’ll let you know when Rack Riot launches in your city.'
      );
      setFormData(initialForm);
    } catch (error) {
      console.error('Waitlist submission failed', error);
      setWaitlistError('Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D1B2A_0%,#1B2D42_60%,#0D1B2A_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,77,77,0.12),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(255,255,255,0.03),transparent_24%)]" />
        <div className="relative mx-auto grid min-h-[90vh] w-full max-w-7xl items-stretch md:grid-cols-[0.4fr_0.6fr]">
          <div className="relative z-10 flex items-center px-6 py-14 md:px-8 md:py-16 lg:px-12">
            <div className="w-full max-w-[520px]">
              <h1 className="max-w-[620px] text-[38px] font-extrabold leading-[1] tracking-[-0.03em] text-white md:text-[52px]">
                Any Store. A Personal Stylist. Your Best Look.
              </h1>

              <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-[#7B9BB5]">
                Skip the algorithm. Book real styling help at any store, in person.
              </p>

              <div className="mt-8 flex flex-wrap items-start gap-3">
                <div className="flex flex-col items-center">
                  <Link
                    to="/signup/client"
                    className="inline-flex items-center gap-2 rounded-full bg-[#FF4D4D] px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2A]"
                  >
                    Book a Stylist
                  </Link>
                </div>

                <div className="flex flex-col items-center">
                  <Link
                    to="/apply"
                    className="inline-flex items-center justify-center rounded-full border-[1.5px] border-white bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2A]"
                  >
                    Apply as a Stylist
                  </Link>
                </div>
              </div>

              <p className="mt-4 text-[13px] font-medium text-[#91a9bf]">
                Founding members get first access when Rack Riot launches in your city.
              </p>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="mt-4 inline-flex items-center text-[14px] font-medium text-[#d7e2ec] transition hover:text-white"
              >
                See how it will work ↓
              </button>
            </div>
          </div>

          <div className="relative min-h-[420px] md:-ml-4 md:min-h-[90vh] md:self-stretch md:overflow-hidden">
            <img
              src={heroShoppingImage}
              alt="Stylist and client shopping together in a clothing store"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-[linear-gradient(90deg,#0D1B2A_0%,rgba(13,27,42,0.12)_36%,rgba(13,27,42,0)_100%)] md:w-16 lg:w-20" />
          </div>
        </div>
      </section>

      <section className="bg-[#0D1B2A] px-6 pb-12 pt-10 text-white md:px-8 md:pb-14 md:pt-12 lg:px-12">
        <div id="how-it-works" className="mx-auto w-full max-w-[1100px]">
          <div className="mb-8 max-w-[660px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">How Rack Riot will work</p>
            <h2 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-white md:text-[42px]">
              Simple, human styling — built around your schedule.
            </h2>
            <p className="mt-4 max-w-[600px] text-[16px] leading-7 text-[#7B9BB5]">
              Choose the format that fits your day, then we’ll guide you from first intro to the final fitting room decision.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:gap-3.5 lg:gap-4">
            {options.map((option) => (
              <article
                key={option.id}
                className="group flex min-h-[136px] flex-col rounded-[24px] border border-[#3D5A7A]/55 bg-[linear-gradient(180deg,rgba(27,45,66,0.94)_0%,rgba(24,39,57,0.92)_100%)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-200 hover:border-[#4c6b8c]/70 hover:bg-[linear-gradient(180deg,rgba(29,48,71,0.96)_0%,rgba(24,39,57,0.94)_100%)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.2)] lg:p-5"
              >
                <h3 className="text-[20px] font-semibold leading-tight text-white">{option.title}</h3>
                <p className="mt-2.5 max-w-[30ch] text-[14px] leading-6 text-[#8ca8c3]">{option.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[22px] border border-[#314a64]/40 bg-[linear-gradient(180deg,rgba(18,34,51,0.66)_0%,rgba(14,28,42,0.54)_100%)] px-4 py-4 shadow-[0_10px_26px_rgba(0,0,0,0.1)]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#3D5A7A]/55 bg-[#13273a]/45 text-[11px] font-semibold text-[#b2c4d5]">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold leading-5 text-[#edf4fa]">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#8ca8c3]">{step.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-[14px] leading-6 text-[#7B9BB5]">
              Founding members get first access when Rack Riot launches in your city.
            </p>
          </div>
        </div>
      </section>

      {modalType ? (
        <WaitlistModal
          modalType={modalType}
          modalStep={modalStep}
          formData={formData}
          fieldErrors={fieldErrors}
          submitting={submitting}
          waitlistError={waitlistError}
          successMessage={successMessage}
          onClose={closeWaitlistModal}
          onChange={updateField}
          onNextStep={handleStylistStepAdvance}
          onPreviousStep={() => setModalStep(1)}
          onSubmit={handleWaitlistSubmit}
        />
      ) : null}
    </>
  );
}
