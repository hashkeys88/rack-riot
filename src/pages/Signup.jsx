import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'I want to find a stylist',
    description: 'Book a personal stylist or find a shopping buddy in your city',
    cta: 'Sign up as a Client',
    to: '/signup/client'
  },
  {
    title: 'I want to be a stylist',
    description: 'Join our founding stylist network and start earning doing what you love',
    cta: 'Apply as a Stylist',
    to: '/apply',
    footnote: 'Be one of the first stylists in your city'
  }
];

export default function Signup() {
  return (
    <section className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-12">
      <div className="mx-auto max-w-6xl">
      <h1 className="text-[32px] font-bold">Get Started</h1>
      <p className="mt-2 text-[14px] text-riotTextSecondary">Choose your path into Rack Riot.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="riot-card transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <h2 className="text-[20px] font-semibold text-riotText">{card.title}</h2>
            <p className="mt-3 text-[14px] text-riotTextSecondary">{card.description}</p>
            <Link to={card.to} className="mt-6 inline-flex rounded-md bg-riotAccent px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-riotAccentHover">
              {card.cta}
            </Link>
            {card.footnote ? <p className="mt-3 text-[12px] text-riotTextMuted">{card.footnote}</p> : null}
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
