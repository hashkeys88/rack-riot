import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-riotBorder bg-riotBgSecondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 md:px-12">
        <div>
          <h3 className="font-logo text-[22px] text-riotAccent">Rack Riot</h3>
          <p className="mt-2 max-w-sm text-[14px] text-riotTextSecondary">Book social styling sessions or find a shopping buddy who matches your fit energy.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[14px] text-riotTextSecondary">
          <Link to="/stylists" className="hover:text-riotText">Stylists</Link>
          <Link to="/buddies" className="hover:text-riotText">Buddies</Link>
          <Link to="/dashboard" className="hover:text-riotText">Dashboard</Link>
          <Link to="/signup" className="hover:text-riotText">Get Started</Link>
        </div>
      </div>
    </footer>
  );
}
