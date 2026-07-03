import { Button } from '@astryxdesign/core/Button';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';

export default function StepHeader({ title, subtitle, step, onBack }) {
  return (
    <header>
      <div className="mb-7 min-h-[20px]">
        {onBack ? (
          <Button label="Back" variant="ghost" size="sm" onClick={onBack} />
        ) : null}
      </div>

      <ProgressBar label={`Step ${step.current} of ${step.total}`} value={step.current} max={step.total} hasValueLabel />
      <div className="mt-8">
        <Text type="display-2" as="h1">{title}</Text>
        {subtitle ? <Text type="large" as="p" color="secondary">{subtitle}</Text> : null}
      </div>
    </header>
  );
}
