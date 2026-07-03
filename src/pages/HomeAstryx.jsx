import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { ArrowDownRight, ArrowRight, Check, MapPin, Sparkles } from 'lucide-react';
import heroImage from '../assets/rackriot-all-ages.jpg';

const occasions = [
  ['The work week', 'Build a rotation that feels polished without feeling like a uniform.', 'blue'],
  ['Wedding season', 'Decode the dress code and find something worth wearing again.', 'pink'],
  ['A new chapter', 'Reset your wardrobe after a move, career change, or life shift.', 'green'],
  ['Everyday confidence', 'Make ordinary mornings clearer, quicker, and more like you.', 'yellow']
];

const steps = [
  ['01', 'Share the moment', 'Tell us where you are going, what feels difficult, and how you want to feel.'],
  ['02', 'Meet your person', 'We match you with a local stylist whose approach fits your life and taste.'],
  ['03', 'Shop in real life', 'Meet at stores you already love and make clear decisions together.']
];

export default function HomeAstryx() {
  return (
    <div className="astryx-home">
      <section className="astryx-hero">
        <div className="astryx-hero-copy">
          <Badge variant="yellow" icon={<Sparkles size={14} />} label="Personal styling, in person" />
          <Text type="display-1" as="h1" color="inherit">
            Get dressed for the life you have now.
          </Text>
          <Text type="large" as="p" color="inherit">
            A personal stylist meets you at the stores you already love, helps you see what works, and makes shopping feel clear again.
          </Text>
          <div className="astryx-actions">
            <Button label="Find my stylist" variant="primary" size="lg" href="/signup/client" endContent={<ArrowRight size={16} />} />
            <Button label="Apply as a stylist" variant="secondary" size="lg" href="/stylists" />
          </div>
          <div className="astryx-location">
            <MapPin size={16} />
            <Text type="label" color="inherit">Now matching in San Francisco</Text>
          </div>
        </div>
        <div className="astryx-hero-visual">
          <img src={heroImage} alt="Adults of different ages enjoying a styling session together" fetchPriority="high" />
          <div className="astryx-image-note">
            <Text type="label" color="inherit">For every age, body, gender, and occasion</Text>
          </div>
        </div>
        <a className="astryx-scroll-cue" href="#occasions">
          See what we can solve <ArrowDownRight size={17} />
        </a>
      </section>

      <section id="occasions" className="astryx-section">
        <div className="astryx-section-heading">
          <div>
            <Badge variant="blue" label="Made for real life" />
            <Text type="display-2" as="h2">One stylist. A hundred reasons.</Text>
          </div>
          <Text type="large" as="p" color="secondary">
            You do not need to know fashion. Start with what is happening in your life, and we will meet you there.
          </Text>
        </div>
        <div className="astryx-occasion-grid">
          {occasions.map(([title, copy, variant], index) => (
            <Card key={title} variant={variant} padding={6} minHeight={260}>
              <Text type="code" color="secondary">0{index + 1}</Text>
              <div className="astryx-card-copy">
                <Text type="display-3" as="h3">{title}</Text>
                <Text type="body" as="p" color="secondary">{copy}</Text>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="astryx-process">
        <div className="astryx-process-intro">
          <Badge variant="pink" label="Simple by design" />
          <Text type="display-2" as="h2" color="inherit">The opposite of shopping alone and hoping for the best.</Text>
        </div>
        <div className="astryx-step-list">
          {steps.map(([number, title, copy]) => (
            <article key={title} className="astryx-step">
              <Text type="code" color="inherit">{number}</Text>
              <div>
                <Text type="display-3" as="h3" color="inherit">{title}</Text>
                <Text type="body" as="p" color="inherit">{copy}</Text>
              </div>
              <span className="astryx-check"><Check size={18} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="astryx-final">
        <Text type="display-1" as="h2" color="inherit">Your closet should make your life easier.</Text>
        <Text type="large" as="p" color="inherit">Let’s make shopping feel human again.</Text>
        <Button label="Start my match" variant="primary" size="lg" href="/signup/client" endContent={<ArrowRight size={16} />} />
      </section>
    </div>
  );
}
