import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import isEmail from 'validator/lib/isEmail';
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

function validateWaitlistEmail(rawEmail) {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const [username = '', domain = ''] = normalizedEmail.split('@');
  const domainParts = domain.split('.');
  const tld = domainParts.at(-1) || '';
  const hasValidUsername = username.length >= 1;
  const hasDotInDomain = domain.includes('.');
  const hasValidTld = /^[a-z]{2,}$/i.test(tld);
  const hasValidShape = isEmail(normalizedEmail);

  if (!normalizedEmail) {
    return { valid: false, normalizedEmail, message: 'Please enter a valid email address' };
  }

  if (!hasValidUsername || !hasDotInDomain || !hasValidTld || !hasValidShape) {
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
    title: 'Option 1: Solo Session',
    description:
      'Book a stylist for one-on-one support and walk out with looks that fit your budget, body, and everyday life.'
  },
  {
    id: '02',
    title: 'Option 2: Group Session',
    description:
      'Bring your crew, split the cost, and turn shopping into a social experience with expert guidance in real stores.'
  },
  {
    id: '03',
    title: 'Option 3: Find a Shopping Buddy',
    description:
      'Tell us your city and style, then get matched with people nearby to plan your next haul together.'
  }
];

const initialForm = {
  name: '',
  email: '',
  city: '',
  experience: ''
};

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function CityAutocompleteInput({ value, onChange }) {
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
        placeholder="City"
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

function WaitlistModal({
  modalType,
  formData,
  emailError,
  submitting,
  waitlistError,
  successMessage,
  onClose,
  onChange,
  onSubmit
}) {
  const isStylist = modalType === 'stylist';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_28px_80px_rgba(63,33,24,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">Founding members</p>
            <h2 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#161616]">
              {isStylist ? 'Apply as a stylist' : 'Get early access'}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#5d5d5d]">
              {isStylist ? 'Tell us about your styling background and where you want to launch.' : 'Be first to hear when Rack Riot opens in your city.'}
            </p>
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
          <div className="mt-6 rounded-[20px] border border-[#1f1f1f]/8 bg-[#fffaf6] px-5 py-4">
            <p className="text-[15px] font-medium text-[#161616]">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="Your name"
              className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="Email"
              className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-4 py-3 text-[16px] font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
            />
            {emailError ? <p className="text-[13px] font-medium text-[#FF4D4D]">{emailError}</p> : null}
            <CityAutocompleteInput value={formData.city} onChange={(value) => onChange('city', value)} />
            {isStylist ? (
              <textarea
                value={formData.experience}
                onChange={(event) => onChange('experience', event.target.value)}
                placeholder="Tell us about your styling background"
                rows={4}
                className="w-full rounded-[24px] border border-[#1f1f1f]/12 bg-[#fffaf6] px-5 py-3 text-[14px] font-medium text-[#161616] placeholder:text-[#9c9c9c] focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
              />
            ) : null}
            {waitlistError ? <p className="text-[13px] font-medium text-[#d24747]">{waitlistError}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#ff4d4d] px-5 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : isStylist ? 'Apply to Join' : 'Count me in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    function handleOpenWaitlist(event) {
      const nextType = event?.detail?.type === 'stylist' ? 'stylist' : 'client';
      setFormData(initialForm);
      setEmailError('');
      setWaitlistError('');
      setSuccessMessage('');
      setModalType(nextType);
    }

    window.addEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
    return () => window.removeEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
  }, []);

  function openWaitlistModal(type) {
    setFormData(initialForm);
    setEmailError('');
    setWaitlistError('');
    setSuccessMessage('');
    setModalType(type);
  }

  function closeWaitlistModal() {
    if (submitting) return;
    setModalType(null);
  }

  function updateField(field, value) {
    if (field === 'email') {
      setEmailError('');
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleWaitlistSubmit(event) {
    event.preventDefault();

    const { valid: emailValid, normalizedEmail, message: emailValidationMessage } = validateWaitlistEmail(formData.email);
    const normalizedName = formData.name.trim();
    const normalizedCity = formData.city.trim();
    const normalizedExperience = formData.experience.trim();
    const isStylist = modalType === 'stylist';

    if (!emailValid) {
      setEmailError(emailValidationMessage);
      return;
    }

    setEmailError('');

    if (isStylist && !normalizedExperience) {
      setWaitlistError('Please tell us about your styling background.');
      return;
    }

    setSubmitting(true);
    setWaitlistError('');

    try {
      const payload = {
        email: normalizedEmail,
        name: normalizedName || null,
        city: normalizedCity || null,
        experience: isStylist ? normalizedExperience : null,
        type: isStylist ? 'stylist' : 'client'
      };

      const { error } = await supabase.from('waitlist').insert(payload);

      if (error) {
        const message = String(error.message || '').toLowerCase();
        if (error.code === '23505' || message.includes('duplicate') || message.includes('unique')) {
          setWaitlistError(
            isStylist ? "You've already applied as a stylist!" : "You're already on the client waitlist!"
          );
          return;
        }
        throw error;
      }

      setSuccessMessage(
        isStylist
          ? "Thanks! We'll be in touch when we launch in your city."
          : "You're in 🎉 We'll reach out when we launch in your city."
      );
      setFormData(initialForm);
    } catch {
      setWaitlistError('Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D1B2A_0%,#1B2D42_60%,#0D1B2A_100%)] pb-14 pt-4 text-white md:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,77,77,0.18),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(255,255,255,0.04),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(13,27,42,0),rgba(13,27,42,0.9))]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:px-12 md:py-20">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">In-person styling for real life</p>
            <h1 className="mt-4 max-w-[620px] text-[42px] font-extrabold leading-[0.98] tracking-[-0.03em] text-white md:text-[64px]">
              Personal styling meets real-world shopping
            </h1>

            <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-[#7B9BB5]">
              Skip the algorithm. Book a real stylist, at any store, in person.
            </p>

            <div className="mt-9 flex flex-wrap items-start gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => openWaitlistModal('client')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF4D4D] px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2A]"
                >
                  Book a Stylist
                </button>
              </div>

              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => openWaitlistModal('stylist')}
                  className="inline-flex items-center justify-center rounded-full border-[1.5px] border-white bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2A]"
                >
                  Apply as a Stylist
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(255,77,77,0.2),transparent_52%)] blur-2xl" />
            <div
              className="relative overflow-hidden rounded-[12px]"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 0%, black 82%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 0%, black 82%, transparent 100%)'
              }}
            >
              <div className="relative h-[360px] md:h-[500px]">
                <img
                  src={heroShoppingImage}
                  alt="Stylish shopper carrying bags"
                  className="h-full w-full rounded-[12px] object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 rounded-[12px] bg-[rgba(13,27,42,0.25)] mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0D1B2A] px-6 pb-20 pt-12 text-white md:px-12 md:pb-24 md:pt-14">
        <div id="how-it-works" className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[760px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">How it works</p>
            <h2 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-white md:text-[44px]">Choose the shopping plan that fits your energy</h2>
            <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-[#7B9BB5]">
              Start solo, book with friends, or join the buddy flow. Rack Riot keeps the experience human, flexible, and built around real stores.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {options.map((option) => (
              <article
                key={option.id}
                className="group flex min-h-[330px] flex-col rounded-[28px] border-[0.5px] border-[#3D5A7A] bg-[#1B2D42] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-[4px] hover:border-[#3D5A7A] hover:shadow-[0_24px_52px_rgba(0,0,0,0.28)]"
              >
                <h3 className="text-[25px] font-semibold leading-tight text-white">{option.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#7B9BB5]">{option.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {modalType ? (
        <WaitlistModal
          modalType={modalType}
          formData={formData}
          emailError={emailError}
          submitting={submitting}
          waitlistError={waitlistError}
          successMessage={successMessage}
          onClose={closeWaitlistModal}
          onChange={updateField}
          onSubmit={handleWaitlistSubmit}
        />
      ) : null}
    </>
  );
}
