import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import CityAutocompleteInput from '../CityAutocompleteInput';
import OnboardingLayout from './OnboardingLayout';
import OptionCard from './OptionCard';
import OptionList from './OptionList';
import PrimaryButton from './PrimaryButton';
import StepHeader from './StepHeader';

function TextField({ label, type = 'text', value, onChange, placeholder, required = false }) {
  const sharedClassName =
    'min-h-[56px] w-full rounded-xl border border-riotBorder bg-[#fcfcfc] px-4 py-3 text-[15px] font-medium text-riotText transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5';

  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-riotText">
        {label}
        {required ? <span className="ml-1 text-riotAccent">*</span> : null}
      </span>
      {type === 'city' ? (
        <CityAutocompleteInput
          value={value}
          onChange={onChange}
          inputId={`field-${label.toLowerCase().replace(/\s+/g, '-')}`}
          placeholder={placeholder}
          className={sharedClassName}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={sharedClassName}
        />
      )}
    </label>
  );
}

export default function OnboardingFlow({
  homePath = '/',
  backToHomeLabel = 'Back to home',
  choiceSteps,
  contactStep,
  successState,
  onSubmit
}) {
  const totalSteps = choiceSteps.length + 1;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  const currentChoiceStep = stepIndex < choiceSteps.length ? choiceSteps[stepIndex] : null;
  const isContactStep = stepIndex === choiceSteps.length;
  const canGoBack = stepIndex > 0 && !complete;

  const canContinue = useMemo(() => {
    if (!currentChoiceStep) return false;
    const currentValue = answers[currentChoiceStep.id];

    if (currentChoiceStep.selection === 'multiple') {
      return Array.isArray(currentValue) && currentValue.length > 0;
    }

    return Boolean(currentValue);
  }, [answers, currentChoiceStep]);

  function handleOptionSelect(step, optionValue) {
    setError('');
    setAnswers((current) => {
      if (step.selection === 'multiple') {
        const existing = Array.isArray(current[step.id]) ? current[step.id] : [];
        const nextValues = existing.includes(optionValue)
          ? existing.filter((value) => value !== optionValue)
          : [...existing, optionValue];

        return { ...current, [step.id]: nextValues };
      }

      return { ...current, [step.id]: optionValue };
    });
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setError('');

    try {
      await onSubmit({ answers, fields });
      setComplete(true);
    } catch (caughtError) {
      const message = String(caughtError?.message || 'Something went wrong. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const requiredFieldMissing = contactStep.fields.some(
    (field) => field.required && !String(fields[field.id] || '').trim()
  );

  return (
    <OnboardingLayout>
      <Link to={homePath} className="text-[14px] text-riotTextSecondary transition hover:text-riotText">
        ← {backToHomeLabel}
      </Link>

      {complete ? (
        <section className="mt-10 py-10 text-center">
          <h1 className="mx-auto max-w-[16ch] text-[32px] font-bold leading-[1.08] text-riotText md:text-[36px]">
            {successState.title}
          </h1>
          <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-7 text-riotTextSecondary">{successState.subtitle}</p>
          <Link
            to={homePath}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-riotBorder px-6 text-[14px] font-semibold text-riotText transition hover:border-black"
          >
            Back home
          </Link>
        </section>
      ) : (
        <section className="mt-10">
          <StepHeader
            title={isContactStep ? contactStep.title : currentChoiceStep.title}
            subtitle={isContactStep ? contactStep.subtitle : currentChoiceStep.subtitle}
            step={{ current: stepIndex + 1, total: totalSteps }}
            onBack={canGoBack ? () => setStepIndex((current) => Math.max(0, current - 1)) : undefined}
          />

          {currentChoiceStep ? (
            <>
              <OptionList>
                {currentChoiceStep.options.map((option) => {
                  const stepValue = answers[currentChoiceStep.id];
                  const selected =
                    currentChoiceStep.selection === 'multiple'
                      ? Array.isArray(stepValue) && stepValue.includes(option.value)
                      : stepValue === option.value;

                  return (
                    <OptionCard
                      key={option.value}
                      label={option.label}
                      selected={selected}
                      onClick={() => handleOptionSelect(currentChoiceStep, option.value)}
                    />
                  );
                })}
              </OptionList>

              <div className="mt-8 flex justify-end">
                <PrimaryButton disabled={!canContinue} onClick={() => setStepIndex((current) => current + 1)}>
                  Next
                </PrimaryButton>
              </div>
            </>
          ) : null}

          {isContactStep ? (
            <section className="mt-8 space-y-5">
              {contactStep.fields.map((field) => (
                <TextField
                  key={field.id}
                  label={field.label}
                  type={field.type}
                  value={fields[field.id] || ''}
                  onChange={(value) => {
                    setError('');
                    setFields((current) => ({ ...current, [field.id]: value }));
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ))}

              {error ? <p className="text-sm text-riotError">{error}</p> : null}

              <div className="mt-8 flex justify-end">
                <PrimaryButton
                  disabled={submitting || requiredFieldMissing}
                  onClick={handleFinalSubmit}
                >
                  {submitting ? 'Submitting...' : contactStep.submitLabel}
                </PrimaryButton>
              </div>
            </section>
          ) : null}
        </section>
      )}
    </OnboardingLayout>
  );
}
