import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Wordmark() {
  return (
    <span className="astryx-wordmark">
      <span>Rack</span>
      <span>Riot</span>
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
    <header className="astryx-navbar">
      <nav>
        <Link to="/" onClick={() => setMenuOpen(false)} className="relative z-50 text-atelier-ink" aria-label="Rack Riot home">
          <Wordmark />
        </Link>

        <div className="astryx-desktop-nav">
          <a href="/#occasions">
            How it works
          </a>
          <Link to="/stylists">
            For stylists
          </Link>

          {loading || isLoggingOut || (user && !profile) ? (
            <span className="astryx-nav-status">
              {isLoggingOut ? 'Signing out' : 'Loading'}
            </span>
          ) : user && role ? (
            <>
              <NavLink to={dashboardPath} className="astryx-dashboard-link">
                {dashboardLabel}
              </NavLink>
              <Button label="Log out" variant="ghost" size="sm" onClick={handleLogout} />
            </>
          ) : (
            <>
              <Link to="/login">
                Log in
              </Link>
              <Button label="Find a stylist" variant="primary" size="lg" href="/signup/client" endContent={<ArrowRight size={15} />} />
            </>
          )}
        </div>

        <button
          type="button"
          className="astryx-menu-button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen ? (
        <div className="astryx-mobile-nav">
          <div className="flex flex-col">
            <a href="/#occasions" onClick={() => setMenuOpen(false)} className="astryx-mobile-link">
              How it works
            </a>
            <Link to="/stylists" onClick={() => setMenuOpen(false)} className="astryx-mobile-link">
              For stylists
            </Link>
            {user && role ? (
              <>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="astryx-mobile-link">
                  {dashboardLabel}
                </Link>
                <button onClick={handleLogout} className="astryx-mobile-link text-left">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="astryx-mobile-link">
                  Log in
                </Link>
                <Link to="/signup/client" onClick={() => setMenuOpen(false)} className="astryx-mobile-cta">
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
