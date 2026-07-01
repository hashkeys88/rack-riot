export default function PrimaryButton({
  children,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`atelier-button atelier-button-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
