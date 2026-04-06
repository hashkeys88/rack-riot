import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ctaChips = ['No subscription', 'Any store', 'Real stylists'];

const options = [
  {
    id: '01',
    title: 'Option 1: Solo Session',
    description:
      'Book a stylist for one-on-one support and walk out with looks that fit your budget, body, and everyday life.',
    cta: 'Book a Stylist',
    to: '/stylists'
  },
  {
    id: '02',
    title: 'Option 2: Group Session',
    description:
      'Bring your crew, split the cost, and turn shopping into a social experience with expert guidance in real stores.',
    cta: 'Plan a Group Session',
    to: '/signup/client'
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
              Book a personal stylist or find your shopping crew. In person, at any store, with guidance that actually fits your vibe.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/stylists"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff4d4d] px-6 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf7f2]"
              >
                Book a Stylist
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/buddies"
                className="inline-flex items-center justify-center rounded-full border border-[#1f1f1f]/12 bg-white px-6 py-3 text-[14px] font-semibold text-[#171717] transition duration-150 hover:border-[#1f1f1f]/20 hover:bg-[#fff4f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf7f2]"
              >
                Find a Buddy
              </Link>
            </div>

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
        <div className="mx-auto max-w-[1180px]">
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
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8c8c8c]">{option.id}</p>
                  {option.badge ? (
                    <span className="rounded-full border border-[#ff4d4d]/20 bg-[#fff0ec] px-2.5 py-1 text-[11px] font-semibold text-[#d24747]">
                      {option.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-5 text-[25px] font-semibold leading-tight text-[#181818]">{option.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#5d5d5d]">{option.description}</p>

                {option.cta ? (
                  <div className="mt-auto pt-8">
                    <Link
                      to={option.to}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff4d4d] px-5 py-3 text-[14px] font-semibold text-white transition duration-150 hover:bg-[#e03e3e]"
                    >
                      {option.cta}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
