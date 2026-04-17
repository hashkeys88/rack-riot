import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

function statusBadge(status) {
  if (status === 'approved' || status === 'confirmed' || status === 'completed') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
  if (status === 'pending') return 'border-amber-300/30 bg-amber-300/10 text-amber-200';
  if (status === 'rejected' || status === 'cancelled') return 'border-red-400/30 bg-red-400/10 text-red-300';
  return 'border-white/20 bg-white/5 text-riotText/85';
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    const line = headers
      .map((key) => {
        const raw = row[key] == null ? '' : String(row[key]);
        return `"${raw.replace(/"/g, '""')}"`;
      })
      .join(',');
    lines.push(line);
  });
  return lines.join('\n');
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applicationFilter, setApplicationFilter] = useState('pending');
  const [bookingFilter, setBookingFilter] = useState('pending');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [waitlistRes, bookingRes] = await Promise.all([
          supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
          supabase
            .from('sessions')
            .select('*, host:users!sessions_host_id_fkey(full_name), stylist:stylists(id, users(full_name))')
            .order('created_at', { ascending: false })
        ]);

        if (waitlistRes.error) throw waitlistRes.error;
        if (bookingRes.error) throw bookingRes.error;

        if (!mounted) return;
        const entries = waitlistRes.data || [];
        setApplications(entries.filter((row) => row.type === 'stylist'));
        setWaitlist(entries.filter((row) => row.type === 'client'));
        setBookings(bookingRes.data || []);
      } catch {
        if (!mounted) return;
        toast.error('Unexpected error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredApplications = useMemo(
    () => applications.filter((item) => (applicationFilter ? item.status === applicationFilter : true)),
    [applications, applicationFilter]
  );
  const filteredBookings = useMemo(() => bookings.filter((item) => (bookingFilter ? item.status === bookingFilter : true)), [bookings, bookingFilter]);
  const cityCounts = useMemo(() => {
    return waitlist.reduce((acc, row) => {
      const key = row.city || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [waitlist]);

  async function rejectApplication(id) {
    try {
      const { error } = await supabase.from('waitlist').update({ status: 'rejected' }).eq('id', id).eq('type', 'stylist');
      if (error) throw error;
      setApplications((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item)));
      toast.success('Application rejected');
    } catch {
      toast.error('Unexpected error');
    }
  }

  async function approveApplication(application) {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approveStylist',
          applicationId: application.id,
          email: application.email,
          fullName: application.name,
          city: application.city,
          bio: application.experience,
          specialtyTags: [],
          rateExpectation: application.years_experience,
          instagramHandle: application.portfolio
        })
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Could not approve application');

      const { error: updateError } = await supabase.from('waitlist').update({ status: 'approved' }).eq('id', application.id).eq('type', 'stylist');
      if (updateError) throw updateError;
      setApplications((prev) => prev.map((item) => (item.id === application.id ? { ...item, status: 'approved' } : item)));
      toast.success('Application approved');
    } catch (error) {
      const message = String(error?.message || '');
      if (message.toLowerCase().includes('email')) {
        toast.error('Application is missing email. Add an email to approve.');
      } else {
        toast.error(message || 'Unexpected error');
      }
    }
  }

  function exportWaitlist() {
    const csv = toCsv(
      waitlist.map((row) => ({
        email: row.email,
        city: row.city,
        date_joined: row.created_at
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rack-riot-waitlist.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-[32px] font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-riotText/80">Manage applications, waitlist, and bookings.</p>

      <article className="riot-card mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-riotAccent">Stylist Applications</h2>
          <select value={applicationFilter} onChange={(event) => setApplicationFilter(event.target.value)} className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm">
            {['pending', 'approved', 'rejected'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="text-riotText/70">
                <th className="pb-2">Name</th>
                <th className="pb-2">City</th>
                <th className="pb-2">Portfolio</th>
                <th className="pb-2">Experience</th>
                <th className="pb-2">Years</th>
                <th className="pb-2">Date Applied</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-3 text-riotText/75">Loading...</td>
                </tr>
              ) : filteredApplications.length ? (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="border-t border-white/10">
                    <td className="py-2">{application.name}</td>
                    <td className="py-2">{application.city}</td>
                    <td className="py-2">{application.portfolio || '-'}</td>
                    <td className="py-2">{application.experience || '-'}</td>
                    <td className="py-2">{application.years_experience || '-'}</td>
                    <td className="py-2">{application.created_at ? new Date(application.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusBadge(application.status)}`}>{application.status}</span>
                    </td>
                    <td className="py-2">
                      {application.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => approveApplication(application)} className="rounded-md bg-riotAccent px-3 py-1 text-xs font-semibold text-black">Approve</button>
                          <button onClick={() => rejectApplication(application.id)} className="rounded-md border border-white/20 px-3 py-1 text-xs">Reject</button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-3 text-riotText/75">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="riot-card mt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-riotAccent">Waitlist</h2>
          <button onClick={exportWaitlist} className="rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black">Export as CSV</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-riotText/80">
          {Object.entries(cityCounts).map(([city, count]) => (
            <span key={city} className="rounded-full border border-white/20 px-2 py-1">
              {city}: {count}
            </span>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="text-riotText/70">
                <th className="pb-2">Email</th>
                <th className="pb-2">City</th>
                <th className="pb-2">Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-3 text-riotText/75">Loading...</td>
                </tr>
              ) : waitlist.length ? (
                waitlist.map((entry) => (
                  <tr key={entry.id} className="border-t border-white/10">
                    <td className="py-2">{entry.email}</td>
                    <td className="py-2">{entry.city}</td>
                    <td className="py-2">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-3 text-riotText/75">No waitlist entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="riot-card mt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-riotAccent">Bookings</h2>
          <select value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)} className="rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm">
            {['pending', 'confirmed', 'completed'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="text-riotText/70">
                <th className="pb-2">Client</th>
                <th className="pb-2">Stylist</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Stores</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-3 text-riotText/75">Loading...</td>
                </tr>
              ) : filteredBookings.length ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-white/10">
                    <td className="py-2">{booking.host?.full_name || '-'}</td>
                    <td className="py-2">{booking.stylist?.users?.full_name || '-'}</td>
                    <td className="py-2">{booking.date || '-'}</td>
                    <td className="py-2">{booking.session_type}</td>
                    <td className="py-2">{(booking.stores || []).join(', ') || '-'}</td>
                    <td className="py-2"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusBadge(booking.status)}`}>{booking.status}</span></td>
                    <td className="py-2">${Number(booking.total_price) || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-3 text-riotText/75">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
