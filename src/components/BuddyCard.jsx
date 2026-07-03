import TagPill from './TagPill';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';

export default function BuddyCard({ buddy, onMatch }) {
  return (
    <Card padding={5} height="100%">
      <img src={buddy.avatar_url} alt={buddy.full_name} className="h-48 w-full rounded-lg object-cover" />
      <div className="mt-4 space-y-2">
        <Text type="large" as="h3" weight="bold">{buddy.full_name}</Text>
        <Text type="supporting" as="p">{buddy.city}</Text>
        <div className="flex flex-wrap gap-2">
          {(buddy.style_tags || []).map((tag) => (
            <TagPill key={tag} label={`#${tag}`} />
          ))}
        </div>
        <Text type="supporting" as="p">Favorite stores: {(buddy.favorite_stores || []).join(', ') || 'None listed'}</Text>
        <Text type="label" color="accent">Match {buddy.match_score || 0}%</Text>
        <Button label={buddy.pending ? 'Pending' : 'Request match'} variant="primary" isDisabled={Boolean(buddy.pending)} onClick={() => onMatch(buddy)} />
      </div>
    </Card>
  );
}
