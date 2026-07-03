import { ProgressBar } from '@astryxdesign/core/ProgressBar';

export default function StepIndicator({ step, total }) {
  return <ProgressBar label={`Step ${step} of ${total}`} value={step} max={total} hasValueLabel />;
}
