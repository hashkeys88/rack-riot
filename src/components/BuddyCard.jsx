import TagPill from './TagPill';

export default function BuddyCard({ buddy, onMatch }) {
  return (
    <article className="riot-card h-full">
      <img src={buddy.avatar_url} alt={buddy.full_name} className="h-48 w-full rounded-lg object-cover" />
      <div className="mt-4 space-y-2">
        <h3 className="text-xl font-semibold">{buddy.full_name}</h3>
        <p className="text-sm text-riotText/80">{buddy.city}</p>
        <div className="flex flex-wrap gap-2">
          {(buddy.style_tags || []).map((tag) => (
            <TagPill key={tag} label={`#${tag}`} />
          ))}
        </div>
        <p className="text-sm text-riotText/80">Favorite stores: {(buddy.favorite_stores || []).join(', ') || 'None listed'}</p>
        <p className="font-semibold text-riotAccent">Match {buddy.match_score || 0}%</p>
        <button
          onClick={() => onMatch(buddy)}
          disabled={Boolean(buddy.pending)}
          className="mt-2 inline-flex rounded-md bg-riotAccent px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buddy.pending ? 'Pending' : 'Match'}
        </button>
      </div>
    </article>
  );
}
