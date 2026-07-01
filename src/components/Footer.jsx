import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t-2 border-play-plum bg-play-sky px-6 py-12 text-play-plum sm:px-10 lg:px-14 xl:px-20">
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-playful text-[44px] font-extrabold leading-none">Rack Riot <span className="text-play-coral">♥</span></p>
          <p className="mt-4 max-w-md text-[14px] font-bold leading-7 text-play-plum/65">
            Good clothes, kind advice, and a shopping day you will actually want to repeat.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[12px] font-black text-play-plum/70">
          <Link to="/signup/client" className="inline-flex items-center gap-2 transition hover:-rotate-2 hover:text-play-coral">
            Find a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/stylists" className="inline-flex items-center gap-2 transition hover:rotate-2 hover:text-play-coral">
            Join as a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/login" className="transition hover:text-play-coral">Log in</Link>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1320px] flex-col gap-2 border-t-2 border-play-plum/15 pt-6 text-[10px] font-black uppercase tracking-[0.12em] text-play-plum/45 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Rack Riot</span>
        <span>San Francisco, California</span>
      </div>
    </footer>
  );
}
