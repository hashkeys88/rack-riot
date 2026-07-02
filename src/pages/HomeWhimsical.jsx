import { ArrowRight, Heart, MapPin, MessageCircleHeart, Shirt, Sparkles, Star, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import friendsShoppingImage from '../assets/rackriot-all-ages.jpg';

const steps = [
  {
    icon: MessageCircleHeart,
    title: 'Tell us your style story',
    copy: 'Share what you love, what feels tricky, and what you are shopping for.',
    color: 'bg-play-sky',
    rotate: '-rotate-1'
  },
  {
    icon: Sparkles,
    title: 'Meet your style person',
    copy: 'We find a local stylist who gets your taste, pace, and shopping goals.',
    color: 'bg-play-butter',
    rotate: 'rotate-1'
  },
  {
    icon: Shirt,
    title: 'Go have a great shop',
    copy: 'Meet in person, try things on, laugh a lot, and leave feeling like yourself.',
    color: 'bg-play-mint',
    rotate: '-rotate-[0.5deg]'
  }
];

const stickerWords = ['THE WORK WEEK', 'WEDDING SEASON', 'A FRESH START', 'EVERYDAY CONFIDENCE'];

const lifeMoments = [
  ['Monday morning', 'Workwear that feels capable, comfortable, and entirely like you.', 'bg-play-sky'],
  ['A special wedding', 'Dress codes made simple, from black tie to garden party.', 'bg-play-butter'],
  ['A new chapter', 'A thoughtful wardrobe reset after life, work, or your body changes.', 'bg-play-mint'],
  ['An important interview', 'Walk in feeling prepared before the first question.', 'bg-white'],
  ['A long-awaited trip', 'Pack less, wear everything, and feel good in every photo.', 'bg-[#ffd3c9]'],
  ['No occasion at all', 'Everyday clothes can still bring a little joy.', 'bg-[#d8d5ff]']
];

export default function HomeWhimsical() {
  return (
    <div className="overflow-hidden bg-play-cream text-play-plum">
      <section className="relative px-5 pb-12 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-12">
        <div className="play-dots absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid max-w-[1420px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative z-10">
            <div className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-play-plum bg-play-butter px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] shadow-[3px_3px_0_#4D2C5E]">
              <Sparkles size={15} />
              Personal styling for every stage of life
            </div>

            <h1 className="mt-7 max-w-[760px] font-playful text-[58px] font-extrabold leading-[0.88] tracking-[-0.04em] sm:text-[78px] lg:text-[86px] xl:text-[100px]">
              Feel like
              <span className="relative block w-fit text-play-coral">
                yourself
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 18" aria-hidden="true">
                  <path d="M4 11C72 2 208 2 296 10" fill="none" stroke="#4D2C5E" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
              wherever life takes you.
            </h1>

            <p className="mt-8 max-w-[600px] text-[18px] font-semibold leading-8 text-play-plum/70 sm:text-[20px]">
              From office days and weddings to holidays, interviews, and wardrobe changes, a local stylist helps you dress for the life you are living now.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup/client" className="play-button play-button-primary">
                Meet my stylist
                <ArrowRight size={19} strokeWidth={3} />
              </Link>
              <Link to="/stylists" className="play-button play-button-secondary">
                I&apos;m a stylist
                <Heart size={18} fill="currentColor" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-[13px] font-extrabold text-play-plum/65">
              <span className="flex -space-x-2">
                {['bg-play-coral', 'bg-play-sky', 'bg-play-mint', 'bg-play-butter'].map((color, index) => (
                  <span key={color} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-play-cream ${color}`}>
                    <Star size={14} fill={index % 2 ? '#4D2C5E' : 'white'} className={index % 2 ? 'text-play-plum' : 'text-white'} />
                  </span>
                ))}
              </span>
              Made for every age, body, gender, budget, and occasion
            </div>
          </div>

          <div className="relative min-h-[500px] sm:min-h-[620px] lg:min-h-[700px]">
            <div className="absolute inset-[4%_0_2%_4%] rotate-2 rounded-[38%_24%_34%_22%/28%_36%_24%_32%] bg-play-sky" />
            <div className="absolute inset-[0_4%_6%_0] -rotate-1 overflow-hidden rounded-[28%_38%_24%_32%/32%_24%_36%_28%] border-[3px] border-play-plum bg-white shadow-[12px_14px_0_#FFD95A]">
              <img src={friendsShoppingImage} alt="Adults of different ages enjoying a styling session together" className="h-full w-full object-cover" fetchPriority="high" />
            </div>
            <div className="all-ages-float absolute -left-1 top-[13%] -rotate-3 rounded-full border-2 border-play-plum bg-play-coral px-5 py-3 font-playful text-[18px] font-extrabold text-white shadow-[4px_4px_0_#4D2C5E] sm:left-0 sm:text-[22px]">
              style has no age limit
            </div>
            <div className="absolute bottom-[3%] right-[1%] rotate-3 rounded-[22px] border-2 border-play-plum bg-play-cream p-4 shadow-[5px_5px_0_#4D2C5E] sm:p-5">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-play-coral">
                <MapPin size={15} />
                Now matching
              </p>
              <p className="mt-1 font-playful text-[24px] font-extrabold">San Francisco</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rotate-[-0.6deg] border-y-2 border-play-plum bg-play-butter py-4">
        <div className="flex min-w-max animate-[ticker_22s_linear_infinite] items-center gap-6 whitespace-nowrap">
          {[...stickerWords, ...stickerWords, ...stickerWords].map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center gap-6 text-[12px] font-black tracking-[0.15em]">
              {word}
              <Star size={16} fill="#FF6B6B" className="text-play-coral" />
            </span>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full bg-play-coral px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white">What are you dressing for?</p>
              <h2 className="mt-6 font-playful text-[48px] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-[68px]">
                Every life has moments worth showing up for.
              </h2>
            </div>
            <p className="max-w-[540px] text-[17px] font-semibold leading-8 text-play-plum/70 lg:justify-self-end">
              You do not need to follow fashion or know exactly what you want. Start with what is happening in your life, and we will meet you there.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lifeMoments.map(([title, copy, color], index) => (
              <article
                key={title}
                className={`all-ages-card ${color} rounded-[30px] border-2 border-play-plum p-7 shadow-[6px_7px_0_#4D2C5E]`}
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <span className="font-playful text-[34px] font-extrabold text-play-plum/20">0{index + 1}</span>
                <h3 className="mt-10 font-playful text-[29px] font-extrabold leading-none">{title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-play-plum/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="the-process" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center">
            <p className="inline-flex rotate-2 rounded-full bg-play-mint px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]">How it works</p>
            <h2 className="mx-auto mt-6 max-w-[760px] font-playful text-[48px] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-[68px]">
              Thoughtful help, without making it complicated.
            </h2>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, copy, color, rotate }, index) => (
              <article key={title} className={`${rotate} rounded-[34px] border-2 border-play-plum ${color} p-7 shadow-[7px_8px_0_#4D2C5E] transition duration-300 hover:-translate-y-2 hover:rotate-0 sm:p-9`}>
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-play-plum bg-play-cream">
                    <Icon size={25} strokeWidth={2.5} />
                  </span>
                  <span className="font-playful text-[36px] font-extrabold text-play-plum/25">0{index + 1}</span>
                </div>
                <h3 className="mt-16 font-playful text-[31px] font-extrabold leading-[1] tracking-[-0.02em]">{title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-play-plum/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[40px] border-2 border-play-plum bg-play-coral p-8 text-white shadow-[8px_9px_0_#4D2C5E] sm:p-12">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[28px] border-white/15" />
            <UsersRound size={34} />
            <p className="mt-16 text-[11px] font-black uppercase tracking-[0.15em]">Looking for a stylist?</p>
            <h2 className="mt-4 max-w-[500px] font-playful text-[48px] font-extrabold leading-[0.95] text-white sm:text-[58px]">
              Let&apos;s find someone who understands your life and style.
            </h2>
            <Link to="/signup/client" className="play-button mt-8 border-white bg-white text-play-coral hover:bg-play-butter hover:text-play-plum">
              Start my match
              <ArrowRight size={18} />
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-[40px] border-2 border-play-plum bg-play-sky p-8 shadow-[8px_9px_0_#4D2C5E] sm:p-12">
            <div className="absolute -bottom-12 -right-8 rotate-12 font-playful text-[180px] font-extrabold leading-none text-white/25">R</div>
            <Sparkles size={34} />
            <p className="mt-16 text-[11px] font-black uppercase tracking-[0.15em]">Already the stylish friend?</p>
            <h2 className="mt-4 max-w-[500px] font-playful text-[48px] font-extrabold leading-[0.95] sm:text-[58px]">
              Turn your eye into your next adventure.
            </h2>
            <Link to="/apply" className="play-button play-button-primary mt-8">
              Apply as a stylist
              <ArrowRight size={18} />
            </Link>
          </article>
        </div>
      </section>

      <section className="bg-play-plum px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[980px] text-center">
          <Heart className="mx-auto text-play-coral" size={42} fill="#FF6B6B" />
          <p className="mt-6 font-playful text-[40px] font-extrabold leading-[1.05] sm:text-[58px]">
            Life changes. Bodies change. Plans change.
            <span className="block text-play-butter">Your wardrobe can grow with you.</span>
          </p>
          <Link to="/signup/client" className="play-button mt-9 border-white bg-play-butter text-play-plum hover:bg-play-mint">
            Come shop with us
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
