import { ArrowDownRight, ArrowRight, Check, MoveUpRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/rackriot-genz-hero.jpg';

const signals = ['MONDAY MEETING', 'SATURDAY WEDDING', 'FIRST DATE', 'BIG INTERVIEW', 'EVERYDAY YOU', 'VACATION MODE'];

const occasions = [
  { label: 'Office, but make it you', note: 'Workwear without the uniform energy', color: 'bg-[#d8ff38]', rotate: '-rotate-2' },
  { label: 'Wedding guest panic', note: 'Dress code decoded. Crisis avoided.', color: 'bg-[#ff70c8]', rotate: 'rotate-2' },
  { label: 'Big interview', note: 'Look ready before you say a word', color: 'bg-[#2457f5] text-white', rotate: '-rotate-1' },
  { label: 'Date night', note: 'Confident, comfortable, still yourself', color: 'bg-[#ffad32]', rotate: 'rotate-1' },
  { label: 'Closet reset', note: 'Keep the gems. Fix the gaps.', color: 'bg-white', rotate: '-rotate-2' },
  { label: 'Just because', note: 'You do not need an occasion', color: 'bg-[#ef3d29] text-white', rotate: 'rotate-2' }
];

const steps = [
  ['01', 'Drop the brief', 'Tell us the vibe, the occasion, the budget, and what is not working.'],
  ['02', 'Meet your match', 'We pair you with a local stylist who understands your taste, not just trends.'],
  ['03', 'Make a day of it', 'Shop together in person. Try the wild card. Leave with things you love.']
];

export default function HomeGenZ() {
  return (
    <div className="genz-page overflow-hidden bg-[#f4f0e7] text-[#121212]">
      <section className="relative min-h-[calc(100vh-76px)] border-b-2 border-black px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="genz-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          <div className="flex flex-col justify-between py-3 lg:py-8">
            <div>
              <p className="genz-reveal genz-delay-1 inline-flex items-center gap-2 border-2 border-black bg-[#d8ff38] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_#121212]">
                <Sparkles size={14} />
                Styling for real life
              </p>
              <h1 className="mt-8 max-w-[760px] font-playful text-[58px] font-black uppercase leading-[0.82] tracking-[-0.065em] sm:text-[82px] lg:text-[94px] xl:text-[116px]">
                <span className="genz-reveal genz-delay-2 block">Every body.</span>
                <span className="genz-reveal genz-delay-3 block text-[#ef3d29]">Every plan.</span>
                <span className="genz-reveal genz-delay-4 block">Your style.</span>
              </h1>
              <p className="genz-reveal genz-delay-5 mt-8 max-w-[570px] text-[17px] font-bold leading-7 sm:text-[20px]">
                From office Mondays to wedding Saturdays, meet a local stylist who helps you feel like yourself wherever life takes you.
              </p>
            </div>

            <div className="genz-reveal genz-delay-6 mt-10">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/signup/client" className="genz-button bg-black text-white">
                  Style my next chapter
                  <ArrowRight size={19} />
                </Link>
                <Link to="/stylists" className="genz-button border-2 border-black bg-transparent">
                  I style people
                  <MoveUpRight size={18} />
                </Link>
              </div>
              <p className="mt-6 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#ef3d29]" />
                For every gender, body, budget, and dress code
              </p>
            </div>
          </div>

          <div className="genz-reveal genz-delay-3 relative min-h-[530px] overflow-hidden border-2 border-black bg-[#2457f5] shadow-[10px_10px_0_#121212] sm:min-h-[680px]">
            <img src={heroImage} alt="Friends styling an outfit together in a colorful boutique" className="h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="genz-float absolute left-4 top-5 rotate-[-5deg] border-2 border-black bg-[#ff70c8] px-4 py-3 font-mono text-[11px] font-black uppercase shadow-[4px_4px_0_#121212] sm:left-8 sm:top-8">
              Whatever is on your calendar
            </div>
            <div className="absolute bottom-5 right-5 max-w-[230px] border-2 border-black bg-[#d8ff38] p-4 shadow-[5px_5px_0_#121212] sm:bottom-8 sm:right-8">
              <Star size={20} fill="#121212" />
              <p className="mt-3 font-playful text-[22px] font-black leading-none">Real-life plans deserve real-life style.</p>
            </div>
          </div>
        </div>
        <a href="#how" className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.15em] lg:flex">
          Keep scrolling
          <ArrowDownRight size={16} />
        </a>
      </section>

      <section className="-rotate-[0.4deg] border-y-2 border-black bg-[#d8ff38] py-4">
        <div className="flex min-w-max animate-[ticker_20s_linear_infinite] gap-8 whitespace-nowrap">
          {[...signals, ...signals, ...signals].map((signal, index) => (
            <span key={`${signal}-${index}`} className="flex items-center gap-8 font-mono text-[11px] font-black tracking-[0.12em]">
              {signal}
              <span className="text-[#ef3d29]">✦</span>
            </span>
          ))}
        </div>
      </section>

      <section className="border-b-2 border-black bg-[#f4f0e7] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#ef3d29]">So, what are we dressing for?</p>
              <h2 className="mt-5 font-playful text-[52px] font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-[72px]">
                Life has a lot of dress codes.
              </h2>
            </div>
            <p className="max-w-[580px] text-[17px] font-bold leading-7 lg:justify-self-end">
              Maybe you need one great outfit. Maybe your whole wardrobe stopped making sense. Either way, there is no “fashion person” test to pass.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map(({ label, note, color, rotate }, index) => (
              <article
                key={label}
                className={`genz-occasion ${rotate} ${color} min-h-[210px] border-2 border-black p-6 shadow-[6px_6px_0_#121212]`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="font-mono text-[10px] font-black">0{index + 1}</span>
                <h3 className="mt-14 font-playful text-[30px] font-black uppercase leading-[0.92]">{label}</h3>
                <p className="mt-3 text-[14px] font-bold opacity-70">{note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-8 border-b-2 border-black pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <h2 className="font-playful text-[54px] font-black uppercase leading-[0.86] tracking-[-0.055em] sm:text-[76px] lg:text-[92px]">
              One human.
              <span className="block text-[#2457f5]">A million moments.</span>
            </h2>
            <p className="max-w-[500px] text-[17px] font-bold leading-7 lg:justify-self-end">
              Tell us where you are going and how you want to feel. We handle the racks, sizing, second opinions, and tiny fitting-room spirals.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map(([number, title, copy], index) => (
              <article key={title} className={`genz-step border-2 border-black p-7 sm:p-9 ${index === 0 ? 'bg-[#ff70c8]' : index === 1 ? 'bg-[#2457f5] text-white' : 'bg-[#ffad32]'}`}>
                <span className="font-mono text-[11px] font-black">{number} / 03</span>
                <h3 className="mt-24 font-playful text-[37px] font-black uppercase leading-[0.9]">{title}</h3>
                <p className="mt-5 text-[15px] font-bold leading-6 opacity-80">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d8ff38]">Yes, this means you</p>
            <h2 className="mt-5 font-playful text-[52px] font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-[72px]">
              Style help is not just for celebrities.
            </h2>
          </div>
          <div className="grid gap-0 border-2 border-white/80">
            {['Your office changed but your closet did not', 'You have a wedding and no clue what the dress code means', 'Shopping drains you before you find anything', 'You want honest help without changing who you are'].map((item) => (
              <div key={item} className="flex items-center gap-5 border-b-2 border-white/30 p-5 last:border-0 sm:p-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8ff38] text-black">
                  <Check size={17} strokeWidth={3} />
                </span>
                <span className="text-[16px] font-bold sm:text-[18px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#ef3d29] px-5 py-24 text-center text-white sm:px-8 lg:py-32">
        <div className="genz-orbit absolute left-[8%] top-10 h-24 w-24 rounded-full border-2 border-white/70" />
        <div className="genz-orbit-reverse absolute bottom-8 right-[10%] h-16 w-16 bg-[#d8ff38]" />
        <div className="relative mx-auto max-w-[900px]">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">Whatever comes next</p>
          <h2 className="mt-5 font-playful text-[58px] font-black uppercase leading-[0.84] tracking-[-0.055em] sm:text-[84px] lg:text-[104px]">
            Show up feeling like yourself.
          </h2>
          <Link to="/signup/client" className="genz-button mt-10 bg-[#d8ff38] text-black shadow-[7px_7px_0_#121212]">
            Start my match
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
