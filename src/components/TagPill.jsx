import { useState } from 'react';

const TagPill = ({ label, selected = false, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const clickable = typeof onClick === 'function';
  const isHoveringUnselected = hovered && clickable && !selected;

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: '999px',
        border: selected ? '1px solid #FF4D4D' : '1px solid transparent',
        background: selected ? '#FF4D4D' : isHoveringUnselected ? '#E8E8E8' : '#F5F5F5',
        color: selected ? '#ffffff' : '#666666',
        fontSize: '12px',
        fontWeight: selected ? '600' : '500',
        fontFamily: 'DM Sans, sans-serif',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  );
};

export default TagPill;
