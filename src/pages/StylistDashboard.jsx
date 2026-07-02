import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, UserRound, WalletCards } from 'lucide-react';
import { toast } from 'react-toastify';
import TagPill from '../components/TagPill';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const cityOptions = ['San Jose', 'San Francisco', 'NYC', 'LA', 'Chicago', 'Austin', 'Other'];
const specialtyOptions = ['thrift', 'vintage', 'streetwear', 'y2k', 'minimalist', 'cottagecore', 'preppy', 'grunge', 'smart casual'];

function resolveInitialName(fullName, email) {
  const cleanName = String(fullName || '').trim();
  const emailPrefix = String(email || '').split('@')[0]?.trim().toLowerCase();
  if (cleanName && !cleanName.includes(' ') && cleanName.toLowerCase() === emailPrefix) {
    return '';
  }
  return cleanName;
}

function statusPill(status) {
  if (status === 'confirmed') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
  if (status === 'pending') return 'border-amber-300/30 bg-amber-300/10 text-amber-200';
  if (status === 'cancelled') return 'border-red-400/30 bg-red-400/10 text-red-300';
  if (status === 'completed') return 'border-white/20 bg-white/10 text-riotText/75';
  return 'border-white/20 bg-white/5 text-riotText/80';
}

export default function StylistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [usersRow, setUsersRow] = useState(null);
  const [stylistsRow, setStylistsRow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    bio: '',
    specialtyTags: []
  });

  const completedCount = useMemo(() => bookings.filter((item) => item.status === 'completed').length, [bookings]);
  const underReview = stylistsRow?.status !== 'approved';
  const estimatedEarnings = useMemo(
    () =>
      bookings.reduce((sum, item) => {
        if (item.status !== 'completed') return sum;
        return sum + (Number(item.total_price) || 0);
      }, 0),
    [bookings]
  );

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [bookingRes, userRes, stylistRes] = await Promise.all([
          supabase
            .from('sessions')
            .select('*, users!sessions_host_id_fkey(full_name)')
            .eq('stylist_id', user.id)
            .order('date', { ascending: true }),
          supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('stylists').select('*').eq('id', user.id).maybeSingle()
        ]);
        if (!mounted) return;

        if (bookingRes.error) throw bookingRes.error;
        if (userRes.error) throw userRes.error;
        if (stylistRes.error) throw stylistRes.error;

        setBookings(bookingRes.data || []);
        setUsersRow(userRes.data || null);
        setStylistsRow(stylistRes.data || null);
        setFormData({
          name: resolveInitialName(userRes.data?.full_name, userRes.data?.email),
          city: userRes.data?.city || '',
          bio: stylistRes.data?.bio || '',
          specialtyTags: stylistRes.data?.specialty_tags || []
        });
      } catch {
        if (!mounted) return;
        toast.error('Could not load stylist dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  function toggleTag(tag) {
    setFormData((prev) => {
      const already = prev.specialtyTags.includes(tag);
      if (!already && prev.specialtyTags.length >= 5) return prev;
      return {
        ...prev,
        specialtyTags: already ? prev.specialtyTags.filter((item) => item !== tag) : [...prev.specialtyTags, tag]
      };
    });
  }

  async function saveProfile(goLive = false) {
    if (!user?.id) return;
    if (!formData.name.trim().includes(' ')) {
      setError('Please enter your first and last name e.g. Jordan Lee');
      return;
    }
    if (!formData.bio.trim() || formData.bio.trim().length < 20) {
      setError('Tell clients a bit more about yourself (min 20 characters)');
      return;
    }
    setSaving(true);
    setError('');
    setProfileSaved(false);
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.name.trim(),
          city: formData.city,
          style_tags: formData.specialtyTags
        })
        .eq('id', user.id);
      if (userError) throw userError;

      const { error: stylistError } = await supabase
        .from('stylists')
        .update({
          bio: formData.bio.trim(),
          specialty_tags: formData.specialtyTags,
          available: true
        })
        .eq('id', user.id);
      if (stylistError) throw stylistError;

      if (goLive) {
        window.location.reload();
        return;
      }

      setUsersRow((prev) => ({ ...(prev || {}), full_name: formData.name.trim(), city: formData.city, style_tags: formData.specialtyTags }));
      setStylistsRow((prev) => ({
        ...(prev || {}),
        bio: formData.bio.trim(),
        specialty_tags: formData.specialtyTags,
        available: true
      }));
      toast.success('Profile saved');
      setProfileSaved(true);
      window.setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setError('Could not save profile. Please try again.');
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!user?.id) return;
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.bio.trim() || formData.bio.trim().length < 10) {
      setError('Please write a short bio (min 10 characters)');
      return;
    }
    if (!formData.specialtyTags?.length) {
      setError('Please select at least one specialty tag');
      return;
    }

    setSaving(true);
    setError('');
    let timeoutHit = false;
    const timeout = window.setTimeout(() => {
      timeoutHit = true;
      setSaving(false);
      setError('Connection timed out. Please try again.');
    }, 8000);

    try {
      const [userUpdate, stylistUpdate] = await Promise.all([
        supabase
          .from('users')
          .update({ full_name: formData.name.trim() })
          .eq('id', user.id),
        supabase
          .from('stylists')
          .update({
            bio: formData.bio.trim(),
            specialty_tags: formData.specialtyTags,
            available: true
          })
          .eq('id', user.id)
      ]);

      window.clearTimeout(timeout);
      if (timeoutHit) return;

      if (userUpdate.error) throw userUpdate.error;
      if (stylistUpdate.error) throw stylistUpdate.error;

      window.location.replace('/stylist-dashboard');
    } catch (e) {
      window.clearTimeout(timeout);
      if (timeoutHit) return;
      setError('Could not save. Please try again.');
      console.error('Profile complete error:', e);
    } finally {
      setSaving(false);
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      const { error: updateError } = await supabase.from('sessions').update({ status }).eq('id', bookingId);
      if (updateError) throw updateError;
      setBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status } : item)));
      toast.success(status === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled');
    } catch {
      toast.error('Could not update booking');
    }
  }

  async function toggleAvailability(available) {
    if (!user?.id) return;
    try {
      const { error: updateError } = await supabase.from('stylists').update({ available }).eq('id', user.id);
      if (updateError) throw updateError;
      setStylistsRow((prev) => ({ ...(prev || {}), available }));
      toast.success(available ? 'You are now available' : 'You are now unavailable');
    } catch {
      toast.error('Could not update availability');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-riotAccent" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Stylist studio</p>
      <h1 className="mt-3 text-[52px] font-semibold leading-none tracking-[-0.04em] sm:text-[64px]">My dashboard</h1>
      <p className="mt-4 text-[15px] text-riotText/80">Manage your profile, availability, client requests, and earnings.</p>

      {underReview ? (
        <div className="mt-6 rounded-[18px] border border-amber-300/40 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="text-[15px] font-bold">Your profile is under review</p>
          <p className="mt-1 text-[14px] leading-6">
            You can update your profile now. Clients will be able to discover it after Rack Riot approves it.
          </p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-y border-atelier-ink/15 bg-transparent px-0">
        <button onClick={() => setActiveTab('overview')} className={`px-0 py-4 text-[12px] font-bold uppercase tracking-[0.08em] ${activeTab === 'overview' ? 'border-b-2 border-atelier-rust text-atelier-ink' : 'text-atelier-muted hover:text-atelier-rust'}`}>Overview</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-0 py-4 text-[12px] font-bold uppercase tracking-[0.08em] ${activeTab === 'bookings' ? 'border-b-2 border-atelier-rust text-atelier-ink' : 'text-atelier-muted hover:text-atelier-rust'}`}>Bookings</button>
        <button onClick={() => setActiveTab('profile')} className={`px-0 py-4 text-[12px] font-bold uppercase tracking-[0.08em] ${activeTab === 'profile' ? 'border-b-2 border-atelier-rust text-atelier-ink' : 'text-atelier-muted hover:text-atelier-rust'}`}>My Profile</button>
        <button onClick={() => setActiveTab('availability')} className={`px-0 py-4 text-[12px] font-bold uppercase tracking-[0.08em] ${activeTab === 'availability' ? 'border-b-2 border-atelier-rust text-atelier-ink' : 'text-atelier-muted hover:text-atelier-rust'}`}>Availability</button>
        <button onClick={() => setActiveTab('earnings')} className={`px-0 py-4 text-[12px] font-bold uppercase tracking-[0.08em] ${activeTab === 'earnings' ? 'border-b-2 border-atelier-rust text-atelier-ink' : 'text-atelier-muted hover:text-atelier-rust'}`}>Earnings</button>
      </div>

      {activeTab === 'overview' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[24px] border border-riotBorder bg-white p-6 shadow-[0_18px_55px_rgba(0,0,0,0.06)] md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">Availability</p>
                <h2 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-riotText">
                  {stylistsRow?.available ? 'You are accepting clients' : 'Ready to take new clients?'}
                </h2>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-riotTextSecondary">
                  Set your availability now. While your profile is under review, we will save this preference for launch.
                </p>
              </div>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stylistsRow?.available ? 'bg-emerald-100 text-emerald-700' : 'bg-[#fff1f1] text-riotAccent'}`}>
                {stylistsRow?.available ? <CheckCircle2 size={22} /> : <Clock3 size={22} />}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => toggleAvailability(!(stylistsRow?.available ?? false))}
                className={`inline-flex h-12 items-center justify-center rounded-full px-6 text-[14px] font-bold transition ${
                  stylistsRow?.available
                    ? 'border border-riotBorder bg-white text-riotText hover:border-riotText'
                    : 'bg-riotAccent text-white hover:bg-riotAccentHover'
                }`}
              >
                {stylistsRow?.available ? 'Pause new requests' : 'Mark me available'}
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className="inline-flex h-12 items-center justify-center rounded-full px-4 text-[14px] font-semibold text-riotTextSecondary transition hover:text-riotText"
              >
                Manage availability
              </button>
            </div>
          </article>

          <article className="rounded-[24px] bg-[#0D1B2A] p-6 text-white shadow-[0_18px_55px_rgba(13,27,42,0.16)] md:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ffb3b3]">Profile preview</p>
            <div className="mt-5 flex items-center gap-4">
              {usersRow?.avatar_url ? (
                <img src={usersRow.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <UserRound size={26} />
                </span>
              )}
              <div>
                <h2 className="text-[22px] font-bold text-white">{usersRow?.full_name || 'Your stylist profile'}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#b7c8d8]">
                  <MapPin size={14} />
                  {usersRow?.city || 'Add your city'}
                </p>
              </div>
            </div>
            <p className="mt-5 line-clamp-3 text-[14px] leading-6 text-[#b7c8d8]">
              {stylistsRow?.bio || 'Add a short bio to help clients understand your approach.'}
            </p>
            <button
              onClick={() => setActiveTab('profile')}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[13px] font-bold text-[#0D1B2A]"
            >
              Edit profile
            </button>
          </article>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {[
              { label: 'Upcoming bookings', value: bookings.filter((item) => item.status !== 'completed' && item.status !== 'cancelled').length, icon: CalendarDays },
              { label: 'Completed sessions', value: completedCount, icon: CheckCircle2 },
              { label: 'Estimated earnings', value: `$${estimatedEarnings}`, icon: WalletCards }
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-[20px] border border-riotBorder bg-white p-5">
                <Icon size={20} className="text-riotAccent" />
                <p className="mt-5 text-[28px] font-bold tracking-[-0.03em] text-riotText">{value}</p>
                <p className="mt-1 text-[13px] font-medium text-riotTextSecondary">{label}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'bookings' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Bookings</h2>
          {bookings.length ? (
            <ul className="mt-4 space-y-3 text-sm">
              {bookings.map((booking) => (
                <li key={booking.id} className="rounded-md border border-white/10 bg-black/30 p-3">
                  <p>Client: {booking.users?.full_name || 'Client'}</p>
                  <p>Date: {booking.date || 'TBD'} at {booking.time || 'TBD'}</p>
                  <p>Session type: {booking.session_type || '-'}</p>
                  <p>Stores: {(booking.stores || []).join(', ') || 'TBD'}</p>
                  <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs ${statusPill(booking.status)}`}>{booking.status}</span>
                  {booking.status === 'pending' ? (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="rounded-md bg-riotAccent px-3 py-1 text-xs font-semibold text-black">Confirm</button>
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="rounded-md border border-white/20 px-3 py-1 text-xs">Cancel</button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-riotText/80">
              {underReview
                ? 'No bookings yet. Your profile will become discoverable after approval.'
                : 'No bookings yet. Your profile is live and clients can find you.'}
            </p>
          )}
        </article>
      ) : null}

      {activeTab === 'profile' ? (
        <article className="riot-card mt-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-riotAccent">My Profile</h2>
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your full name e.g. Jordan Lee"
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2"
            />
            <select value={formData.city} onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))} className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2">
              <option value="">Select city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div>
              <textarea
                value={formData.bio}
                maxLength={300}
                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Tell clients about your style, your favorite stores, and what makes your sessions special..."
                className="min-h-28 w-full rounded-md border border-white/20 bg-black/40 px-3 py-2"
              />
              <p className="mt-1 text-right text-xs text-riotText/60">{formData.bio.length}/300</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((tag) => (
                <TagPill key={tag} label={tag} selected={formData.specialtyTags.includes(tag)} onClick={() => toggleTag(tag)} />
              ))}
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {profileSaved ? (
              <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                <p className="font-medium">
                  {underReview ? 'Profile saved. Changes will appear after approval.' : "Profile saved. You're live on Rack Riot."}
                </p>
                {!underReview ? (
                  <a href="/stylists" className="mt-1 inline-block underline">
                    View your profile
                  </a>
                ) : null}
              </div>
            ) : null}
            <button onClick={() => saveProfile(false)} disabled={saving} className="rounded-md bg-riotAccent px-4 py-2 font-semibold text-black disabled:opacity-60">
              {saving ? 'Saving...' : profileSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </article>
      ) : null}

      {activeTab === 'availability' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Availability</h2>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => toggleAvailability(!(stylistsRow?.available ?? true))}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${stylistsRow?.available ? 'bg-riotAccent text-black' : 'border border-white/20 text-riotText'}`}
            >
              {stylistsRow?.available ? 'Available for bookings' : 'Unavailable for bookings'}
            </button>
          </div>
          <p className="mt-3 text-sm text-riotText/80">
            You are currently {stylistsRow?.available ? 'available' : 'unavailable'} for new bookings
          </p>
        </article>
      ) : null}

      {activeTab === 'earnings' ? (
        <article className="riot-card mt-6">
          <h2 className="text-xl font-semibold text-riotAccent">Earnings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-riotText/75">Total sessions completed</p>
              <p className="mt-2 text-[32px] font-bold">{completedCount}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-riotText/75">Estimated earnings</p>
              <p className="mt-2 text-[32px] font-bold">${estimatedEarnings}</p>
            </div>
          </div>
          <p className="mt-4 rounded-md border border-riotAccent/30 bg-riotAccent/10 px-4 py-3 text-sm text-riotText/90">Payouts coming soon</p>
        </article>
      ) : null}
    </section>
  );
}
