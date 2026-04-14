import { useLocation, useNavigate } from 'react-router-dom';

const WAITLIST_MODAL_EVENT = 'rack-riot:open-waitlist';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

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
    <footer className="border-t border-[#1B2D42] bg-[#0a1520]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-start md:justify-between md:px-8 lg:px-12">
        <div>
          <h3 className="font-logo text-[22px] text-[#FF4D4D]">Rack Riot</h3>
          <p className="mt-2 max-w-sm text-[14px] text-[#7B9BB5]">Skip the algorithm. Book a real stylist at any store, in person.</p>
        </div>
        <div className="flex items-center gap-4 text-[14px] text-[#7B9BB5] md:pt-1">
          <button type="button" onClick={handleOpenWaitlist} className="text-left hover:text-white">Book a Stylist</button>
        </div>
      </div>
    </footer>
  );
}
