import { ArrowDownRight, ArrowRight, Check, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroShoppingImage from '../assets/vitaly-gariev-AixitSFNrBc-unsplash.jpg';

const steps = [
  {
    number: '01',
    title: 'Tell us what is not working',
    copy: 'A quick brief captures the occasion, the wardrobe gap, and how you like to shop.'
  },
  {
    number: '02',
    title: 'Meet your match',
    copy: 'We pair you with a local stylist whose taste and approach fit the assignment.'
  },
  {
    number: '03',
    title: 'Shop like you have an insider',
    copy: 'Meet in person, move through the right stores, and leave with pieces that earn their place.'
  }
];

const promises = [
  'No subscription',
  'Real people, not recommendations',
  'Built around your city',
  'Solo, buddy, or group sessions'
];

export default function HomeRedesign() {
  function scrollToProcess() {
    document.getElementById('the-process')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="overflow-hidden bg-atelier-paper text-atelier-ink">
      <section className="relative min-h-[calc(100vh-76px)] border-b border-atelier-ink/15">
        <div className="absolute inset-0 atelier-grid opacity-60" />
        <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-[1480px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-14 lg:py-14 xl:px-20">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-atelier-muted">
              <span className="h-px w-8 bg-atelier-ink" />
              Personal styling, in real life
            </div>

            <div className="max-w-[680px] py-16 lg:py-20">
              <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.2em] text-atelier-rust">
                Your city / your stores / your point of view
              </p>
              <h1 className="font-editorial text-[58px] font-semibold leading-[0.88] tracking-[-0.055em] text-atelier-ink sm:text-[76px] lg:text-[82px] xl:text-[104px]">
                Get dressed
                <span className="block italic text-atelier-rust">with intention.</span>
              </h1>
              <p className="mt-8 max-w-[540px] text-[18px] leading-8 text-atelier-muted sm:text-[20px]">
                A personal stylist meets you at the stores you already love, helps you see what works, and makes shopping feel clear again.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup/client" className="atelier-button atelier-button-primary">
                  Find my stylist
                  <ArrowRight size={18} />
                </Link>
                <Link to="/stylists" className="atelier-button atelier-button-secondary">
                  I am a stylist
                  <ArrowDownRight size={18} />
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToProcess}
              className="flex w-fit items-center gap-3 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-atelier-muted transition hover:text-atelier-ink"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-atelier-ink/25">
                <ArrowDownRight size={16} />
              </span>
              See the process
            </button>
          </div>

          <div className="relative min-h-[520px] overflow-hidden border-t border-atelier-ink/15 lg:min-h-full lg:border-l lg:border-t-0">
            <img
              src={heroShoppingImage}
              alt="A client shopping with personal styling support"
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,22,0.02),rgba(18,28,22,0.28))]" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-[2px] border border-white/30 bg-[#16231b]/80 p-5 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8 sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-atelier-citrus">Now matching</p>
                <p className="mt-2 font-editorial text-[28px] leading-none">San Francisco</p>
              </div>
              <MapPin size={24} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-atelier-ink/15 bg-atelier-citrus py-4">
        <div className="mx-auto flex max-w-[1480px] flex-wrap justify-center gap-x-8 gap-y-3 px-6 lg:justify-between">
          {promises.map((item) => (
            <span key={item} className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em]">
              <Sparkles size={13} />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section id="the-process" className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-8 border-b border-atelier-ink/20 pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">The Rack Riot method</p>
            <h2 className="font-editorial text-[48px] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-[62px]">
              Less scrolling.
              <br />
              More knowing.
            </h2>
          </div>

          <div className="grid lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className={`group py-10 lg:min-h-[330px] lg:px-9 lg:py-12 ${index > 0 ? 'border-t border-atelier-ink/15 lg:border-l lg:border-t-0' : ''}`}
              >
                <span className="font-mono text-[12px] font-bold text-atelier-rust">{step.number}</span>
                <h3 className="mt-16 max-w-[300px] font-editorial text-[32px] font-semibold leading-[1.05] tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-5 max-w-[350px] text-[15px] leading-7 text-atelier-muted">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-atelier-forest px-6 py-20 text-atelier-paper sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-citrus">For clients</p>
            <h2 className="mt-6 max-w-[760px] font-editorial text-[52px] font-semibold leading-[0.94] tracking-[-0.045em] text-atelier-paper sm:text-[68px]">
              Your wardrobe should make your life easier.
            </h2>
          </div>
          <div className="border-l border-white/20 pl-7 sm:pl-10">
            {['Shop for a specific moment', 'Refresh what you wear every day', 'Build confidence without changing who you are'].map((item) => (
              <div key={item} className="flex gap-4 border-b border-white/15 py-5 first:pt-0">
                <Check className="mt-1 shrink-0 text-atelier-citrus" size={18} />
                <p className="text-[17px] leading-7 text-white/80">{item}</p>
              </div>
            ))}
            <Link to="/signup/client" className="atelier-button mt-8 bg-atelier-citrus text-atelier-ink hover:bg-white">
              Start my match
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto grid max-w-[1320px] overflow-hidden border border-atelier-ink/20 bg-atelier-clay lg:grid-cols-[1fr_0.82fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">For stylists</p>
            <h2 className="mt-5 max-w-[680px] font-editorial text-[46px] font-semibold leading-[0.96] tracking-[-0.04em] sm:text-[62px]">
              Turn a sharp eye into a serious practice.
            </h2>
            <p className="mt-6 max-w-[600px] text-[17px] leading-8 text-atelier-muted">
              Build a profile, set your availability, and meet clients who value thoughtful, one-to-one guidance.
            </p>
            <Link to="/stylists" className="atelier-button atelier-button-secondary mt-9">
              Explore the stylist network
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative min-h-[360px] border-t border-atelier-ink/20 bg-atelier-rust p-8 text-white lg:min-h-full lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-between">
              <span className="font-editorial text-[120px] leading-none text-white/15">R</span>
              <div>
                <p className="max-w-[350px] font-editorial text-[32px] italic leading-[1.08]">
                  “Good styling is not about more. It is about what finally feels right.”
                </p>
                <Link to="/apply" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-1 text-[12px] font-bold uppercase tracking-[0.16em]">
                  Apply to join
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
