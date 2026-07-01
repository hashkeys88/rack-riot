import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, profile, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const role = profile?.role || null;

  function handleLogoClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#1B2D42] bg-[#0D1B2A]">
      <nav className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6 md:px-8 lg:px-12">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex h-full shrink-0 items-center leading-none cursor-pointer font-logo text-[27px] font-normal tracking-[0.05em] sm:text-[29px]"
        >
          <span className="text-white">RACK </span>
          <span className="text-[#FF4D4D]">RIOT</span>
        </Link>

        <div className="flex items-center gap-3">
          {loading || isLoggingOut || (user && !profile) ? (
            <span className="inline-flex h-10 items-center px-3 text-[14px] font-semibold text-[#b7c8d8]">
              {isLoggingOut ? 'Logging out...' : ''}
            </span>
          ) : user && role ? (
            <>
              {role === 'stylist' ? (
                <NavLink to="/stylist-dashboard" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-[#3D5A7A] text-[#7B9BB5] hover:text-white'}`}>
                  My Dashboard
                </NavLink>
              ) : null}
              {role === 'admin' ? (
                <NavLink to="/admin" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-[#3D5A7A] text-[#7B9BB5] hover:text-white'}`}>
                  Admin
                </NavLink>
              ) : null}
              {role === 'client' ? (
                <NavLink to="/dashboard" className={({ isActive }) => `rounded-md px-3 py-1.5 text-[14px] font-medium transition ${isActive ? 'bg-riotAccent text-white' : 'border border-[#3D5A7A] text-[#7B9BB5] hover:text-white'}`}>
                  Dashboard
                </NavLink>
              ) : null}
              <button onClick={handleLogout} className="rounded-md px-3 py-1.5 text-[14px] font-semibold text-[#7B9BB5] transition hover:text-white hover:underline">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#3D5A7A] px-4 text-[14px] font-semibold text-[#b7c8d8] transition hover:border-[#6f8baa] hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/signup/client"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF4D4D] px-4 text-[14px] font-semibold text-white transition hover:bg-[#e03e3e] sm:px-6"
              >
                Book a Stylist
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
