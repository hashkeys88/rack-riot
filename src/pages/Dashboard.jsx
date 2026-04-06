import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TagPill from '../components/TagPill';
import { useAuth } from '../context/AuthContext';
import mockStylists from '../data/mockStylists';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'stylists', label: 'Find a Stylist' },
  { id: 'matches', label: 'Buddy Matches' },
  { id: 'profile', label: 'My Profile' }
];

const styleTagOptions = ['thrift', 'vintage', 'streetwear', 'y2k', 'minimalist', 'cottagecore', 'preppy', 'grunge', 'smart casual'];
const storeOptions = ['Goodwill', 'Buffalo Exchange', 'Crossroads', 'Thrift Town', 'Community Thrift', 'Wasteland', 'Urban Outfitters', 'Zara', 'Depop', 'Other'];
const timeOptions = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

function seededAvatar(id) {
  const seed =
    String(id || 'stylist')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 +
    1;
  return `https://i.pravatar.cc/300?img=${seed}`;
}

function getAvatar(stylist) {
  if (stylist?.users?.avatar_url) return stylist.users.avatar_url;
  return seededAvatar(stylist?.id);
}

function getStylistName(stylist) {
  const name = String(stylist?.users?.full_name || '').trim();
  if (name && name.includes(' ')) return name;
  return 'Stylist (Profile Pending)';
}

function getStylistTags(stylist) {
  const primary = stylist?.specialty_tags || [];
  if (Array.isArray(primary) && primary.length) return primary;
  const fallback = stylist?.users?.style_tags || stylist?.style_tags || [];
  return Array.isArray(fallback) ? fallback : [];
}

function getBioSnippet(stylist) {
  const bio = String(stylist?.bio || '').trim();
  if (!bio) return 'Profile coming soon';
  return bio.length > 80 ? `${bio.slice(0, 80)}...` : bio;
}

function normalizeTag(tag) {
  return String(tag || '').toLowerCase().trim();
}

function bookingStatusClass(status) {
  if (status === 'pending') return 'border-amber-300/30 bg-amber-300/10 text-amber-200';
  if (status === 'confirmed') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
  if (status === 'completed') return 'border-white/20 bg-white/10 text-riotText/70';
  if (status === 'cancelled') return 'border-red-400/30 bg-red-400/10 text-red-300';
  return 'border-white/20 bg-white/10 text-riotText/80';
}

function sessionTypeLabel(type) {
  return type === 'group' ? 'Group' : 'Solo';
}

function firstName(fullName) {
  return String(fullName || '').trim().split(' ')[0] || 'there';
}

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function TogglePills({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <TagPill
          key={option}
          label={option}
          selected={selected.includes(option)}
          onClick={() => onToggle(option)}
        />
      ))}
    </div>
  );
}

function BookingModal({ stylist, user, onClose, onConfirmed }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionType, setSessionType] = useState('solo');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStores, setSelectedStores] = useState([]);
  const [customStore, setCustomStore] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [invitedEmails, setInvitedEmails] = useState([]);

  const totalSteps = sessionType === 'group' ? 5 : 4;
  const confirmStep = sessionType === 'group' ? 5 : 4;
  const inviteStep = sessionType === 'group' ? 4 : null;

  function toggleStore(store) {
    setSelectedStores((prev) => (prev.includes(store) ? prev.filter((item) => item !== store) : [...prev, store]));
  }

  function addCustomStore() {
    const value = customStore.trim();
    if (!value) return;
    if (!selectedStores.includes(value)) {
      setSelectedStores((prev) => [...prev, value]);
    }
    setCustomStore('');
  }

  function addInvite() {
    const email = inviteInput.toLowerCase().trim();
    if (!email || !email.includes('@')) return;
    if (invitedEmails.includes(email) || invitedEmails.length >= 3) {
      setInviteInput('');
      return;
    }
    setInvitedEmails((prev) => [...prev, email]);
    setInviteInput('');
  }

  function removeInvite(email) {
    setInvitedEmails((prev) => prev.filter((item) => item !== email));
  }

  function nextStep() {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        toast.error('Pick date and time');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!selectedStores.length) {
        toast.error('Pick at least one store');
        return;
      }
      setStep(sessionType === 'group' ? 4 : 4);
      return;
    }
    if (step === 4 && sessionType === 'group') {
      setStep(5);
      return;
    }
  }

  function previousStep() {
    if (step === 1) return;
    if (step === 4 && sessionType !== 'group') {
      setStep(3);
      return;
    }
    setStep((prev) => prev - 1);
  }

  async function confirmBooking() {
    if (!user?.id || !stylist?.id) return;

    setLoading(true);
    try {
      const payload = {
        stylist_id: stylist.id,
        host_id: user.id,
        session_type: sessionType === 'group' ? 'group' : 'private',
        date: selectedDate,
        time: selectedTime,
        stores: selectedStores,
        group_size: sessionType === 'group' ? invitedEmails.length + 1 : 1,
        status: 'pending',
        total_price: sessionType === 'group' ? 150 : 75
      };

      const { data: newSession, error } = await supabase.from('sessions').insert(payload).select('*').single();
      if (error) throw error;

      if (sessionType === 'group' && invitedEmails.length) {
        const members = invitedEmails.map((email) => ({
          session_id: newSession.id,
          email,
          status: 'invited'
        }));
        const { error: membersError } = await supabase.from('session_members').insert(members);
        if (membersError) throw membersError;
      }

      toast.success('Booking confirmed! Your stylist will reach out soon.');
      onConfirmed();
    } catch {
      toast.error('Could not confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCloseClick() {
    const shouldClose = window.confirm('Are you sure? Your booking details will be lost.');
    if (shouldClose) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" aria-modal="true" role="dialog">
      <div className="h-full w-full max-w-[560px] overflow-y-auto rounded-xl border border-white/15 bg-riotBg p-5 md:h-auto">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-riotText/80">
            Step {step}/{totalSteps}
          </p>
          <button onClick={handleCloseClick} className="rounded-md border border-white/20 px-2 py-1 text-xs">
            X
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Step 1: Session Type</p>
            <button onClick={() => setSessionType('solo')} className={`w-full rounded-md border p-3 text-left ${sessionType === 'solo' ? 'border-riotAccent bg-riotAccent/10' : 'border-white/20'}`}>
              <p className="font-semibold">Solo Session — $75</p>
              <p className="text-sm text-riotText/80">Just you and your stylist</p>
            </button>
            <button onClick={() => setSessionType('group')} className={`w-full rounded-md border p-3 text-left ${sessionType === 'group' ? 'border-riotAccent bg-riotAccent/10' : 'border-white/20'}`}>
              <p className="font-semibold">Group Session — $150</p>
              <p className="text-sm text-riotText/80">You and up to 3 friends</p>
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Step 2: Date and Time</p>
            <input type="date" min={todayDate()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
            <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2">
              <option value="">Choose time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Step 3: Stores</p>
            <div className="flex flex-wrap gap-2">
              {storeOptions.map((store) => (
                <TagPill
                  key={store}
                  label={store}
                  selected={selectedStores.includes(store)}
                  onClick={() => toggleStore(store)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customStore} onChange={(event) => setCustomStore(event.target.value)} placeholder="Add custom store" className="flex-1 rounded-md border border-white/20 bg-black/40 px-3 py-2" />
              <button onClick={addCustomStore} className="rounded-md border border-white/20 px-3 py-2 text-sm">
                Add
              </button>
            </div>
          </div>
        ) : null}

        {inviteStep && step === inviteStep ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Step 4: Invite Friends</p>
            <div className="flex gap-2">
              <input value={inviteInput} onChange={(event) => setInviteInput(event.target.value)} placeholder="Friend email" className="flex-1 rounded-md border border-white/20 bg-black/40 px-3 py-2" />
              <button onClick={addInvite} className="rounded-md border border-white/20 px-3 py-2 text-sm">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {invitedEmails.map((email) => (
                <button key={email} onClick={() => removeInvite(email)} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                  {email} ×
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === confirmStep ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Step {confirmStep}: Confirm</p>
            <div className="rounded-md border border-white/10 bg-black/30 p-4 text-sm">
              <div className="mb-2 flex items-center gap-3">
                <img
                  src={getAvatar(stylist)}
                  alt={getStylistName(stylist)}
                  onError={(event) => {
                    event.currentTarget.src = seededAvatar(stylist?.id);
                  }}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <p>{getStylistName(stylist)}</p>
              </div>
              <p>Session type: {sessionType === 'group' ? 'Group Session' : 'Solo Session'}</p>
              <p>Date + time: {selectedDate || '-'} {selectedTime || ''}</p>
              <p>Stores: {selectedStores.join(', ')}</p>
              {sessionType === 'group' ? <p>Invited friends: {invitedEmails.join(', ') || 'None'}</p> : null}
              <p className="mt-1 font-semibold text-riotAccent">Total: ${sessionType === 'group' ? 150 : 75}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={previousStep} disabled={step === 1 || loading} className="rounded-md border border-white/20 px-4 py-2 text-sm disabled:opacity-40">
            Back
          </button>

          {step !== confirmStep ? (
            <button onClick={nextStep} disabled={loading} className="rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
              Next
            </button>
          ) : (
            <button onClick={confirmBooking} disabled={loading} className="rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingStylists, setLoadingStylists] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [dismissWelcome, setDismissWelcome] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [sessionMembersBySession, setSessionMembersBySession] = useState({});
  const [stylists, setStylists] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    price: '',
    tags: []
  });
  const [bookingStylist, setBookingStylist] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    city: '',
    styleTags: [],
    favoriteStores: []
  });

  const showWelcomeBanner = useMemo(() => {
    if (dismissWelcome) return false;
    if (bookings.length > 0) return false;
    if (!profile?.created_at) return false;
    const created = new Date(profile.created_at).getTime();
    return Date.now() - created <= 60 * 1000;
  }, [bookings.length, dismissWelcome, profile?.created_at]);

  const filteredStylists = useMemo(() => {
    return stylists.filter((stylist) => {
      const stylistCity = stylist?.users?.city || stylist?.city || '';
      if (filters.city && stylistCity !== filters.city) return false;

      if (filters.price === 'solo' && Number(stylist.price_private || 0) > 75) return false;
      if (filters.price === 'group' && Number(stylist.price_group || 0) > 150) return false;

      if (filters.tags.length) {
        const sourceTags = (stylist.specialty_tags || []).map(normalizeTag);
        const matchesAny = filters.tags.some((tag) => sourceTags.includes(normalizeTag(tag)));
        if (!matchesAny) return false;
      }

      return true;
    });
  }, [filters.city, filters.price, filters.tags, stylists]);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    async function loadInitial() {
      await Promise.all([loadBookings(), loadMatches(), loadStylists()]);
    }

    async function loadBookings() {
      setLoadingBookings(true);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select(
            `
            *,
            stylists (
              *,
              users ( full_name, avatar_url, city )
            )
          `
          )
          .eq('host_id', user.id)
          .order('date', { ascending: true });
        if (error) throw error;

        if (!mounted) return;
        setBookings(data || []);

        if ((data || []).length) {
          const ids = data.map((item) => item.id);
          const { data: members } = await supabase.from('session_members').select('*').in('session_id', ids);
          const grouped = (members || []).reduce((acc, member) => {
            acc[member.session_id] = [...(acc[member.session_id] || []), member];
            return acc;
          }, {});
          if (mounted) setSessionMembersBySession(grouped);
        } else if (mounted) {
          setSessionMembersBySession({});
        }
      } catch {
        if (!mounted) return;
        setBookings([]);
        setSessionMembersBySession({});
        toast.error('Could not load bookings');
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    }

    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          supabase
            .from('buddy_matches')
            .select(
              `
              *,
              users!buddy_matches_user_a_fkey (
                email,
                full_name,
                avatar_url,
                city,
                style_tags,
                favorite_stores
              )
            `
            )
            .eq('user_b', user.id)
            .eq('status', 'pending'),
          supabase
            .from('buddy_matches')
            .select(
              `
              *,
              users!buddy_matches_user_a_fkey (
                email,
                full_name,
                avatar_url,
                city,
                style_tags,
                favorite_stores
              )
            `
            )
            .eq('user_b', user.id)
            .eq('status', 'accepted')
        ]);

        if (pendingRes.error) throw pendingRes.error;
        if (acceptedRes.error) throw acceptedRes.error;
        if (!mounted) return;
        setPendingMatches(pendingRes.data || []);
        setAcceptedMatches(acceptedRes.data || []);
      } catch {
        if (!mounted) return;
        setPendingMatches([]);
        setAcceptedMatches([]);
        toast.error('Could not load matches');
      } finally {
        if (mounted) setLoadingMatches(false);
      }
    }

    async function loadStylists() {
      setLoadingStylists(true);
      try {
        const { data, error } = await supabase
          .from('stylists')
          .select(
            `
            *,
            users (
              id,
              full_name,
              city,
              avatar_url,
              style_tags
            )
          `
          )
          .eq('available', true);
        if (error) throw error;

        const visibleStylists = (data || []).filter(
          (item) =>
            item?.users?.full_name &&
            item.users.full_name.includes(' ') &&
            item?.bio &&
            item.bio.length > 10
        );
        const displayStylists = visibleStylists.length > 0 ? visibleStylists : mockStylists;

        if (!mounted) return;
        setStylists(displayStylists);
      } catch {
        if (!mounted) return;
        setStylists(mockStylists);
      } finally {
        if (mounted) setLoadingStylists(false);
      }
    }

    loadInitial();

    setProfileForm({
      fullName: profile?.full_name || '',
      city: profile?.city || '',
      styleTags: profile?.style_tags || [],
      favoriteStores: profile?.favorite_stores || []
    });

    return () => {
      mounted = false;
    };
  }, [profile?.city, profile?.favorite_stores, profile?.full_name, profile?.style_tags, user?.id]);

  async function reloadBookingsAndSwitch() {
    setActiveTab('bookings');
    setLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(
          `
          *,
          stylists (
            *,
            users ( full_name, avatar_url, city )
          )
        `
        )
        .eq('host_id', user.id)
        .order('date', { ascending: true });
      if (error) throw error;
      setBookings(data || []);
      setBookingStylist(null);
    } catch {
      toast.error('Could not refresh bookings');
    } finally {
      setLoadingBookings(false);
    }
  }

  async function cancelBooking(bookingId) {
    const approved = window.confirm('Are you sure you want to cancel this booking?');
    if (!approved) return;

    try {
      const { error } = await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', bookingId);
      if (error) throw error;
      toast.success('Booking cancelled');
      await reloadBookingsAndSwitch();
    } catch {
      toast.error('Could not cancel booking');
    }
  }

  async function updateMatchStatus(matchId, status) {
    try {
      const { error } = await supabase.from('buddy_matches').update({ status }).eq('id', matchId);
      if (error) throw error;
      if (status === 'accepted') {
        toast.success('Match accepted! Start planning your trip.');
      } else {
        toast.success('Match declined');
      }

      setPendingMatches((prev) => prev.filter((item) => item.id !== matchId));
      if (status === 'accepted') {
        const accepted = pendingMatches.find((item) => item.id === matchId);
        if (accepted) setAcceptedMatches((prev) => [...prev, { ...accepted, status: 'accepted' }]);
      }
    } catch {
      toast.error('Could not update match');
    }
  }

  function toggleFilterTag(tag) {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag]
    }));
  }

  function toggleStyleTag(tag) {
    setProfileForm((prev) => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag) ? prev.styleTags.filter((item) => item !== tag) : [...prev.styleTags, tag]
    }));
  }

  function toggleStore(store) {
    setProfileForm((prev) => ({
      ...prev,
      favoriteStores: prev.favoriteStores.includes(store)
        ? prev.favoriteStores.filter((item) => item !== store)
        : [...prev.favoriteStores, store]
    }));
  }

  async function saveProfile() {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.fullName.trim(),
          city: profileForm.city.trim(),
          style_tags: profileForm.styleTags,
          favorite_stores: profileForm.favoriteStores
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile saved');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <h1 className="text-[32px] font-bold">My Dashboard</h1>
      <p className="mt-2 text-riotText/80">Welcome back, {profile?.full_name || 'Client'}.</p>

      {showWelcomeBanner ? (
        <article className="riot-card mt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">Welcome to Rack Riot, {firstName(profile?.full_name)}!</p>
              <p className="mt-1 text-sm text-riotText/80">Ready to find your stylist?</p>
              <button onClick={() => setActiveTab('stylists')} className="mt-3 rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black">
                Find a Stylist
              </button>
            </div>
            <button onClick={() => setDismissWelcome(true)} className="rounded-md border border-white/20 px-2 py-1 text-xs">
              X
            </button>
          </div>
        </article>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-8 border-b border-riotBorder bg-white px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-0 py-3 text-[14px] font-medium transition ${activeTab === tab.id ? 'border-b-2 border-riotText text-riotText' : 'text-riotTextSecondary hover:text-riotText'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Bookings</h2>

          {loadingBookings ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-md bg-white/10" />
              ))}
            </div>
          ) : bookings.length ? (
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <article key={booking.id} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatar(booking.stylists)}
                        alt={getStylistName(booking.stylists)}
                        onError={(event) => {
                          event.currentTarget.src = seededAvatar(booking.stylists?.id);
                        }}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{getStylistName(booking.stylists)}</p>
                        <p className="text-riotText/70">{booking.date || 'TBD'} · {booking.time || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs">{sessionTypeLabel(booking.session_type)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${bookingStatusClass(booking.status)}`}>{booking.status}</span>
                    </div>
                  </div>

                  <p className="mt-2">Stores: {(booking.stores || []).join(', ') || 'TBD'}</p>

                  {booking.session_type === 'group' ? (
                    <div className="mt-2 space-y-1">
                      <p>People attending: {booking.group_size || 1}</p>
                      {(sessionMembersBySession[booking.id] || []).length ? (
                        <div className="space-y-1">
                          {(sessionMembersBySession[booking.id] || []).map((member) => (
                            <p key={member.id} className="text-xs text-riotText/75">
                              {member.email} · {member.status}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {booking.status === 'pending' ? (
                    <button onClick={() => cancelBooking(booking.id)} className="mt-3 rounded-md border border-white/20 px-3 py-1 text-xs">
                      Cancel
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-riotText/80">No upcoming bookings yet</p>
              <button onClick={() => setActiveTab('stylists')} className="mt-3 rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black">
                Find a Stylist
              </button>
            </div>
          )}
        </article>
      ) : null}

      {activeTab === 'stylists' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Find a Stylist</h2>

          <div className="mt-4 grid gap-3 rounded-md border border-white/10 bg-black/20 p-3 md:grid-cols-3">
            <select value={filters.city} onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))} className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm">
              <option value="">All cities</option>
              {[...new Set(stylists.map((item) => item.city).filter(Boolean))].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select value={filters.price} onChange={(event) => setFilters((prev) => ({ ...prev, price: event.target.value }))} className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm">
              <option value="">Any price</option>
              <option value="solo">Solo $75</option>
              <option value="group">Group $150</option>
            </select>
            <div className="md:col-span-1">
              <div className="flex flex-wrap gap-2">
                {styleTagOptions.map((tag) => (
                  <TagPill key={tag} label={tag} selected={filters.tags.includes(tag)} onClick={() => toggleFilterTag(tag)} />
                ))}
              </div>
            </div>
          </div>

          {loadingStylists ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-64 animate-pulse rounded-md bg-white/10" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStylists.map((stylist) => (
                <article key={stylist.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <img
                    src={getAvatar(stylist)}
                    alt={getStylistName(stylist)}
                    onError={(event) => {
                      event.currentTarget.src = seededAvatar(stylist?.id);
                    }}
                    className="mx-auto h-[200px] w-full rounded-lg object-cover object-top sm:w-[200px]"
                  />
                  <p className="mt-3 text-[16px] font-semibold">{getStylistName(stylist)}</p>
                  <p className="text-[13px] text-riotText/70">{`${stylist?.neighborhood || 'Local'} · ${stylist.users?.city || stylist.city || '-'}`}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getStylistTags(stylist).slice(0, 3).map((tag) => (
                      <TagPill key={tag} label={`#${tag}`} />
                    ))}
                  </div>
                  <div className="mt-2 text-[12px]">
                    {Number(stylist.rating || 0) > 0 ? (
                      <span className="text-riotText/80">
                        ⭐ {Number(stylist.rating).toFixed(1)} ({Number(stylist?.review_count || 0)} reviews)
                      </span>
                    ) : (
                      <span className="rounded-full bg-riotAccent px-2 py-0.5 text-xs font-semibold text-black">New</span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] font-medium text-riotText/80">Solo ${stylist.price_private || 75} · Group ${stylist.price_group || 150}</p>
                  <p className="mt-1 text-[13px] font-light text-riotText/70">{getBioSnippet(stylist)}</p>
                  <button onClick={() => setBookingStylist(stylist)} className="mt-3 rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black">
                    Book
                  </button>
                </article>
              ))}
              {!filteredStylists.length ? (
                <article className="col-span-full rounded-md border border-white/10 bg-black/30 p-6 text-center">
                  <p className="text-lg font-semibold">No stylists in your area yet.</p>
                  <p className="mt-1 text-sm text-riotText/75">Know someone with great style?</p>
                  <Link to="/apply" className="mt-3 inline-flex rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black">
                    Invite them to apply →
                  </Link>
                </article>
              ) : null}
            </div>
          )}
        </article>
      ) : null}

      {activeTab === 'matches' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Buddy Matches</h2>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-riotText/80">Pending Matches</h3>
            {loadingMatches ? (
              <div className="mt-3 space-y-3">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="h-24 animate-pulse rounded-md bg-white/10" />
                ))}
              </div>
            ) : pendingMatches.length ? (
              <div className="mt-3 space-y-3">
                {pendingMatches.map((match) => (
                  <article key={match.id} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm">
                    <div className="flex items-center gap-3">
                      <img src={match.users?.avatar_url || 'https://i.pravatar.cc/80?img=12'} alt={match.users?.full_name || 'Buddy'} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold">{match.users?.full_name || 'Buddy'}</p>
                        <p className="text-riotText/70">{match.users?.city || '-'}</p>
                      </div>
                      <span className="ml-auto rounded-full border border-riotAccent/40 px-2 py-0.5 text-xs text-riotAccent">{match.match_score || 0}% match</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(match.users?.style_tags || []).map((tag) => (
                        <TagPill key={tag} label={`#${tag}`} />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(match.users?.favorite_stores || []).map((store) => (
                        <TagPill key={store} label={store} />
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => updateMatchStatus(match.id, 'accepted')} className="rounded-md bg-riotAccent px-3 py-1 text-xs font-semibold text-black">
                        Accept
                      </button>
                      <button onClick={() => updateMatchStatus(match.id, 'declined')} className="rounded-md border border-white/20 px-3 py-1 text-xs">
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-riotText/80">
                No new matches yet.{' '}
                <Link to="/buddies" className="text-riotAccent underline">
                  Join the buddy waitlist
                </Link>
              </p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-riotText/80">Accepted Matches</h3>
            {acceptedMatches.length ? (
              <div className="mt-3 space-y-3">
                {acceptedMatches.map((match) => (
                  <article key={match.id} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm">
                    <div className="flex items-center gap-3">
                      <img src={match.users?.avatar_url || 'https://i.pravatar.cc/80?img=13'} alt={match.users?.full_name || 'Buddy'} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold">{match.users?.full_name || 'Buddy'}</p>
                        <p className="text-riotText/70">{match.users?.city || '-'}</p>
                      </div>
                      <span className="ml-auto rounded-full border border-riotAccent/40 px-2 py-0.5 text-xs text-riotAccent">{match.match_score || 0}% match</span>
                    </div>
                    <div className="mt-3">
                      <button onClick={() => window.open(`mailto:${match.users?.email || ''}`)} className="rounded-md border border-white/20 px-3 py-1 text-xs">
                        Message {match.users?.full_name || 'buddy'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-riotText/80">No accepted matches yet.</p>
            )}
          </div>
        </article>
      ) : null}

      {activeTab === 'profile' ? (
        <article className="riot-card mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-riotAccent">My Profile</h2>
          <input value={profileForm.fullName} onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Full name" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
          <input value={profileForm.city} onChange={(event) => setProfileForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
          <div>
            <p className="mb-2 text-sm text-riotText/80">Style tags</p>
            <TogglePills options={styleTagOptions} selected={profileForm.styleTags} onToggle={toggleStyleTag} />
          </div>
          <div>
            <p className="mb-2 text-sm text-riotText/80">Favorite stores</p>
            <TogglePills options={storeOptions} selected={profileForm.favoriteStores} onToggle={toggleStore} />
          </div>
          <button onClick={saveProfile} disabled={savingProfile} className="rounded-md bg-riotAccent px-4 py-2 font-semibold text-black disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save'}
          </button>
        </article>
      ) : null}

      {bookingStylist ? <BookingModal stylist={bookingStylist} user={user} onClose={() => setBookingStylist(null)} onConfirmed={reloadBookingsAndSwitch} /> : null}
    </section>
  );
}
