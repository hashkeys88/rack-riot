import { Card } from '@astryxdesign/core/Card';

export default function OnboardingLayout({ children }) {
  return (
    <main className="astryx-onboarding">
      <Card maxWidth={720} width="100%" padding={8}>
        {children}
      </Card>
    </main>
  );
}
