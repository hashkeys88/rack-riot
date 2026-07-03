import { Button } from '@astryxdesign/core/Button';

export default function PrimaryButton({
  children,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <Button
      type={type}
      label={typeof children === 'string' ? children : 'Continue'}
      variant="primary"
      size="lg"
      isDisabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </Button>
  );
}
