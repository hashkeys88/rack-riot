import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/15 bg-atelier-forest px-6 py-12 text-atelier-paper sm:px-10 lg:px-14 xl:px-20">
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-editorial text-[42px] font-semibold leading-none text-atelier-paper">Rack Riot.</p>
          <p className="mt-5 max-w-md text-[14px] leading-7 text-white/55">
            Personal styling for real stores, real schedules, and wardrobes that have to work in real life.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white/65">
          <Link to="/signup/client" className="inline-flex items-center gap-2 transition hover:text-atelier-citrus">
            Find a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/stylists" className="inline-flex items-center gap-2 transition hover:text-atelier-citrus">
            Join as a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/login" className="transition hover:text-atelier-citrus">Log in</Link>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1320px] flex-col gap-2 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Rack Riot</span>
        <span>San Francisco, California</span>
      </div>
    </footer>
  );
}
