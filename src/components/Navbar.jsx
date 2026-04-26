import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, profile, logout, loading } = useAuth();
  const role = profile?.role || null;


  function handleLogoClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          {user && role && !loading ? (
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
              <button onClick={logout} className="rounded-md px-3 py-1.5 text-[14px] font-semibold text-[#7B9BB5] transition hover:text-white hover:underline">
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* TODO: Add back "Find a Stylist", "Find a Buddy" as text links and "Log In" button once stylists are onboarded and features are live */}
              <Link
                to="/signup/client"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF4D4D] px-6 text-[14px] font-semibold text-white transition hover:bg-[#e03e3e]"
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
