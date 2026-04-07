import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WAITLIST_MODAL_EVENT = 'rack-riot:open-waitlist';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout, loading } = useAuth();
  const role = profile?.role || null;


  function handleOpenWaitlist(event) {
    event.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(WAITLIST_MODAL_EVENT, { detail: { type: 'client' } }));
    }, 80);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-riotBorder bg-white shadow-[0_1px_0_#E8E8E8]">
      <nav className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="cursor-pointer font-logo text-[28px] font-normal tracking-[0.05em] text-riotAccent">
          RACK RIOT
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && role && !loading ? (
            <>
              {role === 'stylist' ? (
                <NavLink to="/stylist-dashboard" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-riotBorder text-riotTextSecondary hover:text-riotText'}`}>
                  My Dashboard
                </NavLink>
              ) : null}
              {role === 'admin' ? (
                <NavLink to="/admin" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-riotBorder text-riotTextSecondary hover:text-riotText'}`}>
                  Admin
                </NavLink>
              ) : null}
              {role === 'client' ? (
                <NavLink to="/dashboard" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-riotBorder text-riotTextSecondary hover:text-riotText'}`}>
                  Dashboard
                </NavLink>
              ) : null}
              <button onClick={logout} className="rounded-md px-3 py-1.5 text-[14px] font-semibold text-riotTextSecondary transition hover:text-riotText hover:underline">
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* TODO: Add back "Find a Stylist", "Find a Buddy" as text links and "Log In" button once stylists are onboarded and features are live */}
              <button
                type="button"
                onClick={handleOpenWaitlist}
                className="rounded-md bg-riotAccent px-3 py-1.5 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover"
              >
                Book a Stylist
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
