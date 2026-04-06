import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import StepIndicator from '../components/StepIndicator';
import TagPill from '../components/TagPill';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const presetStores = ['Nordstrom', 'Zara', 'Aritzia', 'Uniqlo', 'Kith', 'COS'];
const sessionCards = [
  {
    key: 'private',
    title: 'Solo Session',
    icon: '👤',
    subtitle: 'Just you and your stylist',
    price: '$75',
    bestFor: 'Wardrobe refresh, personal styling'
  },
  {
    key: 'group',
    title: 'Group Session',
    icon: '👥',
    subtitle: 'You, your crew, and your stylist',
    price: '$150 (up to 4 people = $37.50 each)',
    bestFor: 'Friend outings, birthdays, squad refresh'
  },
  {
    key: 'buddy',
    title: 'Shopping Buddy',
    icon: '🤝',
    subtitle: 'Find someone to shop with, no stylist',
    price: 'Free',
    bestFor: 'Coming soon',
    comingSoon: true
  }
];

export default function Book() {
  const { stylistId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState('');
  const [showBuddyHint, setShowBuddyHint] = useState(false);
  const [booking, setBooking] = useState({
    sessionType: 'private',
    date: '',
    time: '',
    groupSize: 2,
    invites: '',
    stores: [],
    customStore: ''
  });

  const totalPrice = useMemo(() => {
    if (booking.sessionType === 'private') return 75;
    if (booking.sessionType === 'buddy') return 0;
    return 150;
  }, [booking.sessionType]);

  function toggleStore(name) {
    setBooking((prev) => ({
      ...prev,
      stores: prev.stores.includes(name) ? prev.stores.filter((x) => x !== name) : [...prev.stores, name]
    }));
  }

  function addCustomStore() {
    const value = booking.customStore.trim();
    if (!value) return;
    if (!booking.stores.includes(value)) {
      setBooking((prev) => ({ ...prev, stores: [...prev.stores, value], customStore: '' }));
    }
  }

  function nextStep() {
    setStep((current) => {
      if (current === 1) {
        return booking.sessionType === 'group' ? 2 : 3;
      }
      if (current === 2) return 3;
      if (current === 3) return 4;
      return current;
    });
  }

  function previousStep() {
    setStep((current) => {
      if (current === 4) return 3;
      if (current === 3) return booking.sessionType === 'group' ? 2 : 1;
      if (current === 2) return 1;
      return current;
    });
  }

  function selectSessionType(type) {
    if (type === 'buddy') {
      setShowBuddyHint(true);
      return;
    }

    setShowBuddyHint(false);
    setBooking((prev) => {
      const next = { ...prev, sessionType: type };
      if (type !== 'group') {
        next.groupSize = 1;
        next.invites = '';
      }
      return next;
    });
  }

  async function confirmBooking() {
    if (!user?.id) return;

    try {
      const inviteEmails = booking.invites
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const { data: sessionRow, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          stylist_id: stylistId,
          host_id: user.id,
          session_type: booking.sessionType,
          date: booking.date || null,
          time: booking.time || null,
          group_size: booking.sessionType === 'group' ? Number(booking.groupSize) || 2 : 1,
          stores: booking.stores,
          status: 'pending',
          total_price: totalPrice
        })
        .select('*')
        .single();

      if (sessionError) throw sessionError;

      if (booking.sessionType === 'group' && inviteEmails.length) {
        const members = inviteEmails.map((email) => ({
          session_id: sessionRow.id,
          email,
          status: 'invited'
        }));

        const { error: membersError } = await supabase.from('session_members').insert(members);
        if (membersError) throw membersError;
      }

      setCreatedSessionId(sessionRow.id);
      setSuccess(true);
      toast.success('Booking confirmed');
    } catch (error) {
      toast.error(error.message || 'Could not confirm booking');
    }
  }

  if (success) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="rounded-xl border border-riotAccent/40 bg-riotAccent/10 p-8 text-center">
          <h1 className="text-[32px] font-bold">Booking Confirmed</h1>
          <p className="mt-3 text-riotText/85">Your session is scheduled. Check your dashboard for updates.</p>
          <p className="mt-2 text-sm text-riotText/80">Session ID: {createdSessionId}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-6 rounded-md bg-riotAccent px-5 py-3 font-semibold text-black">
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-[32px] font-bold">Book Session</h1>
      <p className="mt-2 text-riotText/80">Stylist ID: {stylistId}</p>
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <StepIndicator step={step} total={4} />

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Step 1: Session Type & Time</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {sessionCards.map((card) => (
                <button
                  key={card.key}
                  onClick={() => selectSessionType(card.key)}
                  title={card.comingSoon ? 'Buddy matching is coming soon! Join the waitlist.' : undefined}
                  className={`rounded-md border p-3 text-left transition ${
                    card.comingSoon
                      ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-60'
                      : booking.sessionType === card.key
                        ? 'border-riotAccent bg-riotAccent/10'
                        : 'border-white/20'
                  }`}
                >
                  <p className="text-xl">{card.icon}</p>
                  <p className="mt-2 font-semibold">{card.title}</p>
                  <p className="mt-1 text-xs text-riotText/80">{card.subtitle}</p>
                  <p className="mt-2 text-sm font-semibold text-riotAccent">{card.price}</p>
                  <p className="mt-1 text-xs text-riotText/70">Best for: {card.bestFor}</p>
                  {card.comingSoon ? (
                    <span className="mt-2 inline-flex rounded-full border border-riotAccent/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-riotAccent">
                      Coming Soon
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {showBuddyHint ? (
              <p className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-riotText/85">
                Buddy matching is coming soon! Join the waitlist on <Link to="/buddies" className="text-riotAccent underline">Find a Buddy</Link>.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" value={booking.date} onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value }))} className="rounded-md border border-white/20 bg-black/40 px-3 py-2" />
              <input type="time" value={booking.time} onChange={(e) => setBooking((p) => ({ ...p, time: e.target.value }))} className="rounded-md border border-white/20 bg-black/40 px-3 py-2" />
            </div>
          </div>
        )}

        {step === 2 && booking.sessionType === 'group' && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Step 2: Group & Invites</p>
            <input type="number" min="2" max="4" value={booking.groupSize} onChange={(e) => setBooking((p) => ({ ...p, groupSize: e.target.value }))} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" placeholder="Group size (up to 4)" />
            <input value={booking.invites} onChange={(e) => setBooking((p) => ({ ...p, invites: e.target.value }))} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" placeholder="Invite emails (comma separated)" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Step 3: Pick Stores</p>
            <div className="flex flex-wrap gap-2">
              {presetStores.map((store) => (
                <TagPill key={store} label={store} selected={booking.stores.includes(store)} onClick={() => toggleStore(store)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input value={booking.customStore} onChange={(e) => setBooking((p) => ({ ...p, customStore: e.target.value }))} className="flex-1 rounded-md border border-white/20 bg-black/40 px-3 py-2" placeholder="Add custom store" />
              <button onClick={addCustomStore} className="rounded-md border border-riotAccent px-3 py-2 text-riotAccent">Add</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Step 4: Confirm</p>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-riotText/90">
              <p>Type: {booking.sessionType}</p>
              <p>Date: {booking.date || 'TBD'}</p>
              <p>Time: {booking.time || 'TBD'}</p>
              {booking.sessionType === 'group' ? <p>Group size: {booking.groupSize}</p> : null}
              <p>Stores: {booking.stores.join(', ') || 'TBD'}</p>
              <p className="mt-1 font-semibold text-riotAccent">Total: ${totalPrice}</p>
            </div>
            <button onClick={confirmBooking} className="rounded-md bg-riotAccent px-5 py-3 font-semibold text-black">Confirm Booking</button>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={previousStep} disabled={step === 1} className="rounded-md border border-white/20 px-4 py-2 disabled:opacity-40">Back</button>
          {step < 4 && (
            <button onClick={nextStep} className="rounded-md bg-riotAccent px-4 py-2 font-semibold text-black">Next</button>
          )}
        </div>
      </div>
    </section>
  );
}
