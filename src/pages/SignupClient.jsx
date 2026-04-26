import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import {
  submitClientQuestionnaire,
  validateOnboardingEmail
} from '../lib/onboarding';

const choiceSteps = [
  {
    id: 'outfitNeeds',
    title: 'What do you want help with?',
    subtitle: 'We’ll use this to understand the kind of styling support you want first.',
    selection: 'single',
    options: [
      { value: 'everyday', label: 'Everyday outfits' },
      { value: 'event', label: 'Event / occasion' },
      { value: 'wardrobe', label: 'Wardrobe refresh' }
    ]
  },
  {
    id: 'stylePreference',
    title: 'What style direction fits you best?',
    subtitle: 'This gives us a better sense of who you’ll click with.',
    selection: 'single',
    options: [
      { value: 'classic', label: 'Polished and classic' },
      { value: 'minimal', label: 'Minimal and effortless' },
      { value: 'bold', label: 'Expressive and trend-forward' }
    ]
  },
  {
    id: 'budget',
    title: 'What budget feels comfortable right now?',
    subtitle: 'We’ll keep this in mind when we think about fit.',
    selection: 'single',
    options: [
      { value: 'under-150', label: 'Under $150' },
      { value: '150-300', label: '$150–$300' },
      { value: '300-plus', label: '$300+' }
    ]
  },
  {
    id: 'shoppingPreference',
    title: 'How do you want to shop?',
    subtitle: 'Choose the format that feels easiest for you.',
    selection: 'single',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'group', label: 'With friends' },
      { value: 'buddy', label: 'With one friend' }
    ]
  }
];

export default function SignupClient() {
  return (
    <OnboardingFlow
      choiceSteps={choiceSteps}
      contactStep={{
        title: 'Where should we match you?',
        subtitle: 'Tell us where you are and how to reach you when we’re ready.',
        submitLabel: 'Book a Stylist',
        fields: [
          { id: 'city', label: 'City', type: 'city', placeholder: 'San Jose', required: true },
          { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true }
        ]
      }}
      successState={{
        title: 'You’re on the list. We’ll match you soon.',
        subtitle: 'We’re starting city by city and will reach out when Rack Riot launches near you.'
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

        await submitClientQuestionnaire({
          email: normalizedEmail,
          city: normalizedCity,
          intentType: answers.outfitNeeds,
          sessionType: answers.shoppingPreference
        });
      }}
    />
  );
}
