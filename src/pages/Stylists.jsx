import { useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import TagPill from '../components/TagPill';

const featuredStylists = [
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    neighborhood: 'Mission District',
    city: 'San Francisco',
    tags: ['thrift', 'vintage', 'streetwear'],
    credibility: ['Early stylist', '5+ years styling experience'],
    soloPrice: 75,
    groupPrice: 150,
    bio: 'Thrift-focused stylist who helps clients build standout looks without overspending. Great for vintage hunts and everyday statement pieces.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop&crop=face'
  },
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    neighborhood: 'Williamsburg',
    city: 'New York',
    tags: ['vintage', 'y2k', 'streetwear'],
    credibility: ['Early stylist', 'Editorial eye'],
    soloPrice: 75,
    groupPrice: 150,
    bio: 'NYC stylist with a sharp eye for vintage layering, rare finds, and expressive everyday outfits that still feel wearable.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop&crop=face'
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    neighborhood: 'River North',
    city: 'Chicago',
    tags: ['smart casual', 'minimalist', 'preppy'],
    credibility: ['Early stylist', 'Wardrobe specialist'],
    soloPrice: 75,
    groupPrice: 150,
    bio: 'Helps busy professionals build polished wardrobes that feel modern, versatile, and easy to wear across work and weekends.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&h=500&fit=crop&crop=face'
  },
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    neighborhood: 'Silver Lake',
    city: 'Los Angeles',
    tags: ['casual', 'elevated basics', 'neutral tones'],
    credibility: ['Early stylist', 'Group-session friendly'],
    soloPrice: 85,
    groupPrice: 160,
    bio: 'Focuses on clean, elevated everyday style with an approachable process that works especially well for first-time styling clients.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&crop=face'
  }
];

const launchCities = ['All cities', 'San Francisco', 'New York', 'Chicago', 'Los Angeles'];
const launchStyles = ['All styles', 'Vintage', 'Streetwear', 'Minimalist'];

const cityToStyleMap = {
  Vintage: ['vintage'],
  Streetwear: ['streetwear'],
  Minimalist: ['minimalist', 'neutral tones']
};

export default function Stylists() {
  const [selectedCity, setSelectedCity] = useState('All cities');
  const [selectedStyle, setSelectedStyle] = useState('All styles');
  const [activeStylist, setActiveStylist] = useState(null);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filteredStylists = useMemo(() => {
    return featuredStylists.filter((stylist) => {
      const cityMatch = selectedCity === 'All cities' || stylist.city === selectedCity;
      if (!cityMatch) return false;

      if (selectedStyle === 'All styles') return true;
      const allowedTags = cityToStyleMap[selectedStyle] || [selectedStyle.toLowerCase()];
      return stylist.tags.some((tag) => allowedTags.includes(tag.toLowerCase()));
    });
  }, [selectedCity, selectedStyle]);

  const openReserveModal = (stylist) => {
    setActiveStylist(stylist);
    setSubmitted(false);
    setEmail('');
    setCity(stylist.city || '');
    setNote('');
  };

  const closeReserveModal = () => {
    setActiveStylist(null);
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#ffd0d0] bg-[#fff4f4] px-3 py-1 text-[12px] font-semibold text-[#b43838]">
          <Sparkles size={14} /> Early Access
        </p>
        <h1 className="mt-3 text-[32px] font-bold text-[#121212] md:text-[38px]">Meet the first stylists launching on Rack Riot</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-riotTextSecondary">
          Preview the first stylists we&apos;re onboarding in SF, NYC, and Chicago.
        </p>
        <Link
          to="/apply"
          className="mt-5 inline-flex rounded-md bg-riotAccent px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover"
        >
          Apply as a Stylist
        </Link>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-xl border border-riotBorder bg-white p-4 shadow-riot">
        <div className="flex flex-wrap gap-2">
          {launchCities.map((item) => (
            <TagPill key={item} label={item} selected={selectedCity === item} onClick={() => setSelectedCity(item)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {launchStyles.map((item) => (
            <TagPill key={item} label={item} selected={selectedStyle === item} onClick={() => setSelectedStyle(item)} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredStylists.slice(0, 5).map((stylist) => (
          <article
            key={stylist.id}
            className="rounded-xl border border-riotBorder bg-white p-4 shadow-riot transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            <img src={stylist.avatar} alt={stylist.name} className="h-[220px] w-full rounded-lg object-cover object-top" loading="lazy" />

            <p className="mt-3 text-[18px] font-semibold text-riotText">{stylist.name}</p>
            <p className="text-[13px] text-riotTextSecondary">
              {stylist.neighborhood} · {stylist.city}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {stylist.tags.map((tag) => (
                <TagPill key={`${stylist.id}-${tag}`} label={tag} />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {stylist.credibility.map((item) => (
                <span
                  key={`${stylist.id}-${item}`}
                  className="rounded-full border border-[#f0d5d5] bg-[#fff7f7] px-2.5 py-1 text-[11px] font-semibold text-[#9a3f3f]"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-3 text-[13px] font-medium text-riotText">Solo ${stylist.soloPrice} · Group ${stylist.groupPrice}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-riotTextSecondary">{stylist.bio}</p>

            <button
              onClick={() => openReserveModal(stylist)}
              className="mt-4 inline-flex w-full justify-center rounded-md bg-riotAccent px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover"
              type="button"
            >
              Reserve Spot
            </button>
          </article>
        ))}
      </div>

      {!filteredStylists.length ? (
        <div className="mt-6 rounded-xl border border-riotBorder bg-white p-6 text-center shadow-riot">
          <p className="text-[16px] font-semibold text-riotText">No stylists match these filters yet</p>
          <p className="mt-1 text-[14px] text-riotTextSecondary">Try another city or style to view our early launch lineup.</p>
        </div>
      ) : null}

      {activeStylist ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-riotBorder bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-semibold text-riotText">Reserve your session</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-riotTextSecondary">
                  This stylist is part of our early launch. We&apos;re onboarding stylists city by city and inviting early users first.
                </p>
              </div>
              <button
                onClick={closeReserveModal}
                type="button"
                className="rounded-md border border-riotBorder p-1.5 text-riotTextSecondary transition hover:text-riotText"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-riotTextSecondary">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[13px] font-medium text-riotTextSecondary">City (optional)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="San Francisco"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[13px] font-medium text-riotTextSecondary">
                    What kind of shopping help are you looking for? (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="e.g. everyday wardrobe refresh, event outfits, vintage hunt"
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-riotAccent px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover"
                >
                  Request early access
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-xl border border-[#cbeecf] bg-[#f2fff4] p-4">
                <p className="text-[14px] font-semibold text-[#1a7a2f]">You&apos;re on the list. We&apos;ll reach out as early sessions open in your city.</p>
                <button
                  onClick={closeReserveModal}
                  type="button"
                  className="mt-3 rounded-md border border-[#a8ddb1] px-3 py-2 text-[13px] font-semibold text-[#1f6f2f] transition hover:bg-[#e8fbe9]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
