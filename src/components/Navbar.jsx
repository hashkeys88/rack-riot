import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Wordmark() {
  return (
    <span className="flex -rotate-1 items-center gap-1">
      <span className="font-playful text-[31px] font-extrabold leading-none tracking-[-0.04em]">Rack</span>
      <span className="rounded-full bg-play-coral px-2 py-0.5 font-playful text-[21px] font-extrabold leading-none text-white">Riot</span>
    </span>
  );
}

export default function Navbar() {
  const { user, profile, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const role = profile?.role || null;

  async function handleLogout() {
    setIsLoggingOut(true);
    setMenuOpen(false);
    await logout();
  }

  const dashboardPath = role === 'admin' ? '/admin' : role === 'stylist' ? '/stylist-dashboard' : '/dashboard';
  const dashboardLabel = role === 'admin' ? 'Admin' : 'My dashboard';

  return (
    <header className="sticky top-0 z-50 border-b-2 border-play-plum bg-play-cream/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] w-full max-w-[1480px] items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-20">
        <Link to="/" onClick={() => setMenuOpen(false)} className="relative z-50 text-atelier-ink" aria-label="Rack Riot home">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#the-process" className="text-[12px] font-black text-play-plum/70 transition hover:-rotate-2 hover:text-play-coral">
            How it works
          </a>
          <Link to="/stylists" className="text-[12px] font-black text-play-plum/70 transition hover:rotate-2 hover:text-play-coral">
            For stylists
          </Link>

          {loading || isLoggingOut || (user && !profile) ? (
            <span className="min-w-24 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-muted">
              {isLoggingOut ? 'Signing out' : 'Loading'}
            </span>
          ) : user && role ? (
            <>
              <NavLink to={dashboardPath} className="rounded-full bg-play-butter px-4 py-2 text-[12px] font-black">
                {dashboardLabel}
              </NavLink>
              <button onClick={handleLogout} className="text-[12px] font-black text-play-plum/60 transition hover:text-play-coral">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[12px] font-black text-play-plum/70 transition hover:text-play-coral">
                Log in
              </Link>
              <Link to="/signup/client" className="play-button play-button-primary min-h-[46px] px-5">
                Find a stylist
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border-2 border-play-plum bg-play-butter md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-[76px] border-b-2 border-play-plum bg-play-cream p-6 shadow-[0_12px_0_rgba(77,44,94,0.12)] md:hidden">
          <div className="flex flex-col">
            <a href="/#the-process" onClick={() => setMenuOpen(false)} className="border-b-2 border-play-plum/10 py-4 font-playful text-[28px] font-extrabold">
              How it works
            </a>
            <Link to="/stylists" onClick={() => setMenuOpen(false)} className="border-b-2 border-play-plum/10 py-4 font-playful text-[28px] font-extrabold">
              For stylists
            </Link>
            {user && role ? (
              <>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="border-b-2 border-play-plum/10 py-4 font-playful text-[28px] font-extrabold">
                  {dashboardLabel}
                </Link>
                <button onClick={handleLogout} className="py-4 text-left font-playful text-[28px] font-extrabold text-play-coral">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="border-b-2 border-play-plum/10 py-4 font-playful text-[28px] font-extrabold">
                  Log in
                </Link>
                <Link to="/signup/client" onClick={() => setMenuOpen(false)} className="play-button play-button-primary mt-6">
                  Find a stylist
                  <ArrowRight size={17} />
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
