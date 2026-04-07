import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ctaChips = ['No subscription', 'Any store', 'Launching soon'];
const WAITLIST_MODAL_EVENT = 'rack-riot:open-waitlist';

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

function WaitlistModal({
  modalType,
  formData,
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
              className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-5 py-3 text-[14px] font-medium text-[#161616] placeholder:text-[#9c9c9c] focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="Email"
              className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-5 py-3 text-[14px] font-medium text-[#161616] placeholder:text-[#9c9c9c] focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
            />
            <input
              type="text"
              value={formData.city}
              onChange={(event) => onChange('city', event.target.value)}
              placeholder="City"
              className="w-full rounded-full border border-[#1f1f1f]/12 bg-[#fffaf6] px-5 py-3 text-[14px] font-medium text-[#161616] placeholder:text-[#9c9c9c] focus:border-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/15"
            />
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
  const [submitting, setSubmitting] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    function handleOpenWaitlist(event) {
      const nextType = event?.detail?.type === 'stylist' ? 'stylist' : 'client';
      setFormData(initialForm);
      setWaitlistError('');
      setSuccessMessage('');
      setModalType(nextType);
    }

    window.addEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
    return () => window.removeEventListener(WAITLIST_MODAL_EVENT, handleOpenWaitlist);
  }, []);

  function openWaitlistModal(type) {
    setFormData(initialForm);
    setWaitlistError('');
    setSuccessMessage('');
    setModalType(type);
  }

  function closeWaitlistModal() {
    if (submitting) return;
    setModalType(null);
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleWaitlistSubmit(event) {
    event.preventDefault();

    const normalizedEmail = formData.email.toLowerCase().trim();
    const normalizedName = formData.name.trim();
    const normalizedCity = formData.city.trim();
    const normalizedExperience = formData.experience.trim();
    const isStylist = modalType === 'stylist';

    if (!normalizedEmail) {
      setWaitlistError('Please enter your email.');
      return;
    }

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
          setWaitlistError(isStylist ? "You've already applied!" : "You're already on the list!");
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
      <section className="relative overflow-hidden bg-[#fcf7f2] pb-14 pt-4 text-[#161616] md:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,77,77,0.16),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(0,0,0,0.04),transparent_26%),linear-gradient(135deg,#fffaf6_0%,#f8f1eb_55%,#f4ebe4_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(252,247,242,0),rgba(255,255,255,0.9))]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:px-12 md:py-20">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">In-person styling for real life</p>
            <h1 className="mt-4 max-w-[620px] text-[42px] font-extrabold leading-[0.98] tracking-[-0.03em] text-[#171717] md:text-[64px]">
              Personal styling meets real-world shopping
            </h1>

            <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-[#4d4d4d]">
              Skip the algorithm. Book a real stylist, at any store, in person.
            </p>

            <div className="mt-9 flex flex-wrap items-start gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => openWaitlistModal('client')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff4d4d] px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf7f2]"
                >
                  Get Early Access
                </button>
                <p className="mt-1 text-xs text-gray-400">I want to get styled</p>
              </div>

              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => openWaitlistModal('stylist')}
                  className="inline-flex items-center justify-center rounded-full border border-[#1f1f1f]/12 bg-white px-6 py-3 text-[14px] font-semibold text-[#171717] transition duration-150 hover:border-[#1f1f1f]/20 hover:bg-[#fff4f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf7f2]"
                >
                  Apply as a Stylist
                </button>
                <p className="mt-1 text-xs text-gray-400">I'm a stylist</p>
              </div>
            </div>

            <p className="mt-3 text-[13px] font-medium text-[#7a7a7a]">Be among the first when we launch in your city.</p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {ctaChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#1f1f1f]/10 bg-white/85 px-3.5 py-1.5 text-[12px] font-medium text-[#5b5b5b] shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(255,77,77,0.18),transparent_52%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-[#1f1f1f]/10 bg-white p-3 shadow-[0_28px_80px_rgba(63,33,24,0.16)]">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop"
                alt="Stylish shopper carrying bags"
                className="h-[360px] w-full rounded-[22px] object-cover object-center md:h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffdfb] px-6 pb-20 pt-12 text-[#161616] md:px-12 md:pb-24 md:pt-14">
        <div id="how-it-works" className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[760px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ff4d4d]">How it works</p>
            <h2 className="mt-3 text-[34px] font-bold tracking-[-0.02em] text-[#161616] md:text-[44px]">Choose the shopping plan that fits your energy</h2>
            <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-[#5d5d5d]">
              Start solo, book with friends, or join the buddy flow. Rack Riot keeps the experience human, flexible, and built around real stores.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {options.map((option) => (
              <article
                key={option.id}
                className="group flex min-h-[330px] flex-col rounded-[28px] border border-[#1f1f1f]/10 bg-[#fffaf6] p-8 shadow-[0_16px_40px_rgba(44,24,16,0.08)] transition-all duration-200 hover:-translate-y-[4px] hover:border-[#ff4d4d]/25 hover:shadow-[0_24px_52px_rgba(44,24,16,0.12)]"
              >
                <div className="flex items-start justify-between gap-3">
                  {option.id !== '03' ? (
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8c8c8c]">{option.id}</p>
                  ) : <span />}
                </div>

                <h3 className="mt-5 text-[25px] font-semibold leading-tight text-[#181818]">{option.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#5d5d5d]">{option.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {modalType ? (
        <WaitlistModal
          modalType={modalType}
          formData={formData}
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
