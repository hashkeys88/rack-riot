import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import {
  submitStylistQuestionnaire,
  validateOnboardingEmail
} from '../lib/onboarding';

const choiceSteps = [
  {
    id: 'services',
    title: 'What services do you want to offer?',
    subtitle: 'Start with the styling work you want more of.',
    selection: 'multiple',
    options: [
      { value: 'everyday-styling', label: 'Everyday styling' },
      { value: 'event-styling', label: 'Event / occasion styling' },
      { value: 'wardrobe-refresh', label: 'Wardrobe refresh sessions' }
    ]
  },
  {
    id: 'experience',
    title: 'What best describes your experience?',
    subtitle: 'This helps us understand where you are right now.',
    selection: 'single',
    options: [
      { value: 'professional-stylist', label: 'Professional stylist' },
      { value: 'retail-fashion', label: 'Retail / fashion background' },
      { value: 'beginner-passionate', label: 'Beginner / passionate' }
    ]
  },
  {
    id: 'availability',
    title: 'When are you usually available?',
    subtitle: 'We want to know when you could realistically take clients.',
    selection: 'single',
    options: [
      { value: 'weekdays', label: 'Weekdays' },
      { value: 'weekends', label: 'Weekends' },
      { value: 'flexible', label: 'Flexible' }
    ]
  },
  {
    id: 'workStyle',
    title: 'How do you like to work?',
    subtitle: 'Choose the session format that feels most natural.',
    selection: 'single',
    options: [
      { value: 'solo', label: 'One-on-one sessions' },
      { value: 'group', label: 'Group sessions' },
      { value: 'buddy', label: 'Shopping buddy sessions' }
    ]
  }
];

export default function Apply() {
  return (
    <OnboardingFlow
      choiceSteps={choiceSteps}
      contactStep={{
        title: 'Where should we reach you?',
        subtitle: 'Share the best contact details so we can follow up with the right next step.',
        submitLabel: 'Apply as a Stylist',
        fields: [
          { id: 'city', label: 'City', type: 'city', placeholder: 'San Jose', required: true },
          { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
          { id: 'portfolio', label: 'Portfolio', type: 'text', placeholder: 'Instagram, website, or portfolio link' }
        ]
      }}
      successState={{
        title: 'Application received. We’ll follow up soon.',
        subtitle: 'We’re reviewing stylists city by city and will reach out when we’re ready.'
      }}
      onSubmit={async ({ answers, fields }) => {
        const normalizedCity = String(fields.city || '').trim();
        const { valid, normalizedEmail, message } = validateOnboardingEmail(fields.email || '');

        if (!normalizedCity) {
          throw new Error('Please enter your city.');
        }

        if (!valid) {
          throw new Error(message);
        }

        await submitStylistQuestionnaire({
          email: normalizedEmail,
          city: normalizedCity,
          services: Array.isArray(answers.services) ? answers.services : [],
          experience: answers.experience,
          availability: answers.availability,
          workStyle: answers.workStyle,
          portfolio: String(fields.portfolio || '').trim() || undefined
        });
      }}
    />
  );
}
