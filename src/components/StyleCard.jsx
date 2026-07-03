import { Link } from 'react-router-dom';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import TagPill from './TagPill';

function seededAvatar(id) {
  const seed =
    String(id || 'stylist')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 +
    1;
  return `https://i.pravatar.cc/300?img=${seed}`;
}

function getAvatar(stylist) {
  if (stylist?.users?.avatar_url) return stylist.users.avatar_url;
  if (stylist?.avatar_url) return stylist.avatar_url;
  return seededAvatar(stylist?.id);
}

function getStylistName(stylist) {
  const name = String(stylist?.users?.full_name || stylist?.full_name || '').trim();
  if (name && name.includes(' ')) return name;
  return 'Stylist (Profile Pending)';
}

export default function StyleCard({ stylist }) {
  return (
    <Card padding={5} height="100%">
      <img
        src={getAvatar(stylist)}
        alt={getStylistName(stylist)}
        onError={(event) => {
          event.currentTarget.src = seededAvatar(stylist?.id);
        }}
        className="mx-auto h-[200px] w-full rounded-lg object-cover object-top sm:w-[200px]"
      />
      <div className="mt-4 space-y-2">
        <Text type="large" as="h3" weight="bold">{getStylistName(stylist)}</Text>
        <Text type="supporting" as="p">{stylist.users?.city || stylist.city}</Text>
        <div className="flex flex-wrap gap-2">
          {((stylist.specialty_tags && stylist.specialty_tags.length ? stylist.specialty_tags : stylist.users?.style_tags) || []).map((tag) => (
            <TagPill key={tag} label={`#${tag}`} />
          ))}
        </div>
        <Badge variant="yellow" label={`★ ${stylist.rating || 0} · ${stylist.review_count || 0} reviews`} />
        <Text type="label" color="accent">Group ${stylist.price_group || 150}</Text>
        <Link to={`/book/${stylist.id}`} className="astryx-inline-action">
          Book a session
        </Link>
      </div>
    </Card>
  );
}
