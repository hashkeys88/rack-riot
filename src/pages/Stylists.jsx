import { ArrowRight, CalendarDays, Check, CircleDollarSign, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroShoppingImage from '../assets/vitaly-gariev-AixitSFNrBc-unsplash.jpg';

const benefits = [
  {
    icon: UserRoundCheck,
    title: 'Clients with intent',
    copy: 'Meet people who have already shared what they need, where they shop, and how they want to work.'
  },
  {
    icon: CircleDollarSign,
    title: 'Your rates, your practice',
    copy: 'Shape your pricing and the kinds of sessions that make sense for your expertise.'
  },
  {
    icon: CalendarDays,
    title: 'A schedule that stays yours',
    copy: 'Choose when you are available and build Rack Riot around the rest of your work.'
  }
];

const steps = [
  ['Apply', 'Tell us about your experience, specialties, and point of view.'],
  ['Get reviewed', 'We review every profile before it becomes visible to clients.'],
  ['Build your presence', 'Refine your profile, availability, and service details.'],
  ['Meet clients', 'Receive relevant requests and decide what fits your practice.']
];

export default function Stylists() {
  return (
    <div className="bg-atelier-paper">
      <section className="border-b border-atelier-ink/15">
        <div className="mx-auto grid max-w-[1480px] lg:min-h-[720px] lg:grid-cols-[1fr_0.92fr]">
          <div className="flex items-center px-6 py-16 sm:px-10 lg:px-14 lg:py-24 xl:px-20">
            <div className="max-w-[680px]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">The stylist network</p>
              <h1 className="mt-6 text-[58px] font-semibold leading-[0.9] tracking-[-0.05em] text-atelier-ink sm:text-[76px]">
                Grow a styling practice
                <span className="block italic text-atelier-rust">people remember.</span>
              </h1>
              <p className="mt-8 max-w-[590px] text-[18px] leading-8 text-atelier-muted">
                Join a curated network of independent stylists and meet clients looking for thoughtful, in-person fashion guidance.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/apply" className="atelier-button atelier-button-primary">
                  Apply to join
                  <ArrowRight size={17} />
                </Link>
                <a href="#stylist-details" className="atelier-button atelier-button-secondary">
                  See how it works
                </a>
              </div>
            </div>
          </div>
          <div className="relative min-h-[480px] overflow-hidden border-t border-atelier-ink/15 lg:min-h-full lg:border-l lg:border-t-0">
            <img src={heroShoppingImage} alt="A personal stylist helping a client shop" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-atelier-forest/20" />
            <div className="absolute bottom-6 left-6 right-6 border border-white/30 bg-atelier-paper/90 p-6 backdrop-blur-md sm:bottom-9 sm:left-9 sm:right-9">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Our standard</p>
              <p className="mt-3 font-editorial text-[28px] leading-tight text-atelier-ink">
                Taste is personal. Professionalism is not.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="stylist-details" className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Why Rack Riot</p>
            <h2 className="text-[48px] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-[64px]">
              Independent, not on your own.
            </h2>
          </div>
          <div className="mt-12 grid border-t border-atelier-ink/20 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className={`py-10 lg:min-h-[300px] lg:px-9 lg:py-12 ${index ? 'border-t border-atelier-ink/15 lg:border-l lg:border-t-0' : ''}`}>
                <Icon size={27} strokeWidth={1.5} className="text-atelier-rust" />
                <h3 className="mt-16 font-editorial text-[30px] font-semibold tracking-[-0.025em]">{title}</h3>
                <p className="mt-4 max-w-[340px] text-[15px] leading-7 text-atelier-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-atelier-forest px-6 py-20 text-atelier-paper sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto max-w-[1320px]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-citrus">From application to first client</p>
          <div className="mt-10 grid gap-px bg-white/15 lg:grid-cols-4">
            {steps.map(([title, copy], index) => (
              <article key={title} className="bg-atelier-forest p-7 lg:min-h-[280px] lg:p-9">
                <span className="font-mono text-[11px] text-atelier-citrus">0{index + 1}</span>
                <h2 className="mt-14 font-editorial text-[30px] font-semibold text-atelier-paper">{title}</h2>
                <p className="mt-4 text-[14px] leading-7 text-white/55">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto grid max-w-[1100px] gap-12 border border-atelier-ink/20 bg-atelier-clay p-8 sm:p-12 lg:grid-cols-[1fr_0.8fr] lg:p-16">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Who we are looking for</p>
            <h2 className="mt-5 text-[48px] font-semibold leading-[0.95] tracking-[-0.04em]">A strong eye. An even stronger client experience.</h2>
          </div>
          <div className="space-y-4">
            {['Personal stylists and wardrobe consultants', 'Retail and fashion professionals', 'Clear, generous communicators', 'People who care about how clients feel'].map((item) => (
              <p key={item} className="flex items-start gap-3 border-b border-atelier-ink/15 pb-4 text-[15px] font-semibold leading-6">
                <Check size={17} className="mt-1 shrink-0 text-atelier-rust" />
                {item}
              </p>
            ))}
            <Link to="/apply" className="atelier-button atelier-button-primary mt-5 w-full sm:w-auto">
              Start your application
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
