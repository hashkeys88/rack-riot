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
    <footer className="mt-20 border-t border-[#2d2d2d] bg-[#111111]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 md:px-12">
        <div>
          <h3 className="font-logo text-[22px] text-[#FF4D4D]">Rack Riot</h3>
          <p className="mt-2 max-w-sm text-[14px] text-[#aaaaaa]">Skip the algorithm. Book a real stylist at any store, in person.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[14px] text-[#aaaaaa]">
          <button type="button" onClick={handleOpenWaitlist} className="text-left hover:text-white">Book a Stylist</button>
        </div>
      </div>
    </footer>
  );
}
