import { Link } from 'react-router-dom';
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
    <article className="riot-card h-full">
      <img
        src={getAvatar(stylist)}
        alt={getStylistName(stylist)}
        onError={(event) => {
          event.currentTarget.src = seededAvatar(stylist?.id);
        }}
        className="mx-auto h-[200px] w-full rounded-lg object-cover object-top sm:w-[200px]"
      />
      <div className="mt-4 space-y-2">
        <h3 className="text-[16px] font-semibold">{getStylistName(stylist)}</h3>
        <p className="text-[13px] text-riotText/70">{stylist.users?.city || stylist.city}</p>
        <div className="flex flex-wrap gap-2">
          {((stylist.specialty_tags && stylist.specialty_tags.length ? stylist.specialty_tags : stylist.users?.style_tags) || []).map((tag) => (
            <TagPill key={tag} label={`#${tag}`} />
          ))}
        </div>
        <p className="text-[12px] text-riotText/80">⭐ {stylist.rating || 0} ({stylist.review_count || 0} reviews)</p>
        <p className="text-[13px] font-medium text-riotAccent">Group ${stylist.price_group || 150}</p>
        <Link to={`/book/${stylist.id}`} className="mt-2 inline-flex rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">
          Book
        </Link>
      </div>
    </article>
  );
}
