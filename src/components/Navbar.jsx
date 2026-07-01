import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Wordmark() {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-editorial text-[29px] font-semibold leading-none tracking-[-0.045em]">Rack Riot</span>
      <span className="h-2 w-2 rounded-full bg-atelier-rust" />
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
    <header className="sticky top-0 z-50 border-b border-atelier-ink/15 bg-atelier-paper/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] w-full max-w-[1480px] items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-20">
        <Link to="/" onClick={() => setMenuOpen(false)} className="relative z-50 text-atelier-ink" aria-label="Rack Riot home">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#the-process" className="text-[11px] font-bold uppercase tracking-[0.14em] text-atelier-muted transition hover:text-atelier-rust">
            How it works
          </a>
          <Link to="/stylists" className="text-[11px] font-bold uppercase tracking-[0.14em] text-atelier-muted transition hover:text-atelier-rust">
            For stylists
          </Link>

          {loading || isLoggingOut || (user && !profile) ? (
            <span className="min-w-24 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-atelier-muted">
              {isLoggingOut ? 'Signing out' : 'Loading'}
            </span>
          ) : user && role ? (
            <>
              <NavLink to={dashboardPath} className="border-b border-atelier-ink pb-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                {dashboardLabel}
              </NavLink>
              <button onClick={handleLogout} className="text-[11px] font-bold uppercase tracking-[0.14em] text-atelier-muted transition hover:text-atelier-rust">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[11px] font-bold uppercase tracking-[0.14em] text-atelier-muted transition hover:text-atelier-rust">
                Log in
              </Link>
              <Link to="/signup/client" className="atelier-button min-h-[44px] bg-atelier-ink px-5 text-atelier-paper hover:border-atelier-rust hover:bg-atelier-rust">
                Find a stylist
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="relative z-50 flex h-11 w-11 items-center justify-center border border-atelier-ink/20 md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-[76px] border-b border-atelier-ink/20 bg-atelier-paper p-6 shadow-[0_28px_60px_rgba(23,33,25,0.14)] md:hidden">
          <div className="flex flex-col">
            <a href="/#the-process" onClick={() => setMenuOpen(false)} className="border-b border-atelier-ink/15 py-4 font-editorial text-[28px]">
              How it works
            </a>
            <Link to="/stylists" onClick={() => setMenuOpen(false)} className="border-b border-atelier-ink/15 py-4 font-editorial text-[28px]">
              For stylists
            </Link>
            {user && role ? (
              <>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="border-b border-atelier-ink/15 py-4 font-editorial text-[28px]">
                  {dashboardLabel}
                </Link>
                <button onClick={handleLogout} className="py-4 text-left font-editorial text-[28px] text-atelier-rust">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="border-b border-atelier-ink/15 py-4 font-editorial text-[28px]">
                  Log in
                </Link>
                <Link to="/signup/client" onClick={() => setMenuOpen(false)} className="atelier-button atelier-button-primary mt-6">
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
