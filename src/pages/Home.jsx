import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from 'lucide-react';

const ctaChips = ['No subscription', 'Any store', 'Real stylists'];

const trustItems = [
  {
    icon: ShieldCheck,
    text: 'Real people, real stores, real styling help'
  },
  {
    icon: MapPin,
    text: 'Founding cities launching now'
  },
  {
    icon: CalendarDays,
    text: 'Flexible scheduling'
  }
];

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
      'Tell us your city and style, then get matched with people nearby to plan your next haul together.',
    badge: 'Coming Soon'
  }
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0f0f10]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,77,77,0.18),transparent_45%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.08),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 md:items-center md:gap-12 md:px-12 md:py-20">
          <div>
            <h1 className="max-w-[620px] text-[38px] font-extrabold leading-[1.06] tracking-[-0.01em] text-white md:text-[58px]">
              Personal styling meets real-world shopping
            </h1>

            <p className="mt-5 max-w-[560px] text-[18px] leading-relaxed text-white/75">
              Book a personal stylist or find your shopping crew. In person, at any store, with guidance that actually fits your vibe.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/stylists"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#E03E3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f10]"
              >
                Book a Stylist
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/buddies"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:border-white/70 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f10]"
              >
                Find a Buddy
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {ctaChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-[12px] font-medium text-white/80"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#FF4D4D]/25 via-transparent to-white/10 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop"
                alt="Stylish shopper carrying bags"
                className="h-[360px] w-full object-cover object-center md:h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#ececec] bg-[#f7f7f7]">
        <div className="mx-auto grid max-w-6xl gap-3 px-6 py-5 md:grid-cols-3 md:gap-4 md:px-12">
          {trustItems.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 rounded-lg border border-[#e7e7e7] bg-white px-3.5 py-2.5 text-[13px] text-[#555]"
            >
              <Icon size={15} className="shrink-0 text-[#FF4D4D]" />
              <span className="leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111214] px-6 py-14 md:px-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-[30px] font-bold text-white md:text-[36px]">How it works</h2>
            <p className="mt-2 max-w-[680px] text-[16px] leading-relaxed text-white/70">
              Choose the path that fits your shopping plan and get real in-person support, not algorithm-only recommendations.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {options.map((option) => (
              <article
                key={option.id}
                className="group rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-[2px] hover:border-white/30 hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">{option.id}</p>
                  {option.badge ? (
                    <span className="rounded-full border border-[#FF4D4D]/60 bg-[#FF4D4D]/15 px-2.5 py-1 text-[11px] font-semibold text-[#ffd3d3]">
                      {option.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-[21px] font-semibold leading-tight text-white">{option.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/75">{option.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
