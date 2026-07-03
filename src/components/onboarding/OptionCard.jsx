import { SelectableCard } from '@astryxdesign/core/SelectableCard';
import { Text } from '@astryxdesign/core/Text';

export default function OptionCard({ label, selected, onClick }) {
  return (
    <SelectableCard
      label={label}
      isSelected={selected}
      onChange={onClick}
      variant={selected ? 'yellow' : 'default'}
      padding={5}
      width="100%"
    >
      <div className="astryx-option-content">
        <Text type="large" weight="semibold">{label}</Text>
        <span className={`astryx-radio ${selected ? 'is-selected' : ''}`} aria-hidden="true" />
      </div>
    </SelectableCard>
  );
}
