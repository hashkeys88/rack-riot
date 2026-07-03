import { Badge } from '@astryxdesign/core/Badge';

const TagPill = ({ label, selected = false, onClick }) => {
  const clickable = typeof onClick === 'function';

  return (
    <span
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`astryx-tag ${clickable ? 'is-clickable' : ''}`}
    >
      <Badge variant={selected ? 'red' : 'neutral'} label={label} />
    </span>
  );
};

export default TagPill;
