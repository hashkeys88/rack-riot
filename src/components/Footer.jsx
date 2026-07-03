import { ArrowUpRight } from 'lucide-react';
import { Text } from '@astryxdesign/core/Text';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="astryx-footer">
      <div className="astryx-footer-main">
        <div>
          <Text type="display-3" as="p">Rack Riot <span>♥</span></Text>
          <Text type="body" as="p" color="secondary">
            Good clothes, kind advice, and a shopping day you will actually want to repeat.
          </Text>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[12px] font-black text-play-plum/70">
          <Link to="/signup/client" className="inline-flex items-center gap-2 transition hover:-rotate-2 hover:text-play-coral">
            Find a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/stylists" className="inline-flex items-center gap-2 transition hover:rotate-2 hover:text-play-coral">
            Join as a stylist <ArrowUpRight size={14} />
          </Link>
          <Link to="/login" className="transition hover:text-play-coral">Log in</Link>
        </div>
      </div>
      <div className="astryx-footer-meta">
        <span>© {new Date().getFullYear()} Rack Riot</span>
        <span>San Francisco, California</span>
      </div>
    </footer>
  );
}
