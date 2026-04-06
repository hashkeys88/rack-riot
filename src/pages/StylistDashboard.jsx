import { useEffect, useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('bookings');
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

  const profileComplete = useMemo(() => {
    const name = String(usersRow?.full_name || '').trim();
    const badName = !name;
    const badBio = !String(stylistsRow?.bio || '').trim() || String(stylistsRow?.bio || '').trim().length < 10;
    const tags = stylistsRow?.specialty_tags || [];
    const badTags = !Array.isArray(tags) || tags.length === 0;
    return !(badName || badBio || badTags);
  }, [stylistsRow?.bio, stylistsRow?.specialty_tags, usersRow?.full_name]);

  const completedCount = useMemo(() => bookings.filter((item) => item.status === 'completed').length, [bookings]);
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

  if (!profileComplete) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-10">
        <div className="w-full max-w-[560px] rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-[32px] font-bold text-riotText">Complete your profile to go live</h1>
          <p className="mt-3 text-riotText/80">Fill in the basics and you're live in seconds</p>

          <div className="mt-5 space-y-3">
            <input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} placeholder="Full name" className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2" />
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
            <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-riotText/70">Pick up to 5 specialty tags (min 1)</div>
          </div>

          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

          <button
            onClick={handleComplete}
            disabled={saving}
            className="mt-5 w-full rounded-md bg-riotAccent px-4 py-2 font-semibold text-black disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save and Go Live 🚀'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <h1 className="text-[32px] font-bold">My Dashboard</h1>
      <p className="mt-2 text-riotText/80">Manage bookings, profile, availability, and earnings.</p>

      <div className="mt-8 flex flex-wrap gap-8 border-b border-riotBorder bg-white px-2">
        <button onClick={() => setActiveTab('bookings')} className={`px-0 py-3 text-[14px] font-medium ${activeTab === 'bookings' ? 'border-b-2 border-riotText text-riotText' : 'text-riotTextSecondary hover:text-riotText'}`}>Bookings</button>
        <button onClick={() => setActiveTab('profile')} className={`px-0 py-3 text-[14px] font-medium ${activeTab === 'profile' ? 'border-b-2 border-riotText text-riotText' : 'text-riotTextSecondary hover:text-riotText'}`}>My Profile</button>
        <button onClick={() => setActiveTab('availability')} className={`px-0 py-3 text-[14px] font-medium ${activeTab === 'availability' ? 'border-b-2 border-riotText text-riotText' : 'text-riotTextSecondary hover:text-riotText'}`}>Availability</button>
        <button onClick={() => setActiveTab('earnings')} className={`px-0 py-3 text-[14px] font-medium ${activeTab === 'earnings' ? 'border-b-2 border-riotText text-riotText' : 'text-riotTextSecondary hover:text-riotText'}`}>Earnings</button>
      </div>

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
            <p className="mt-4 text-sm text-riotText/80">No bookings yet. Your profile is live — clients can find you!</p>
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
                <p className="font-medium">✓ Profile saved! You're live on Rack Riot.</p>
                <a href="/stylists" className="mt-1 inline-block underline">
                  View your profile →
                </a>
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
