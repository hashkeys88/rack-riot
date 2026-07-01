export default function StepHeader({ title, subtitle, step, onBack }) {
  return (
    <header>
      <div className="mb-7 min-h-[20px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-riotTextSecondary transition hover:text-atelier-rust"
          >
            Back
          </button>
        ) : null}
      </div>

      <div
        className="mb-10 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${step.total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: step.total }, (_, index) => index + 1).map((item) => (
          <div key={item} className={`h-1 ${item <= step.current ? 'bg-atelier-rust' : 'bg-riotBorder'}`} />
        ))}
      </div>

      <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-atelier-rust">Step {step.current} of {step.total}</p>
      <h1 className="max-w-[14ch] text-[38px] font-semibold leading-[0.98] tracking-[-0.035em] text-riotText md:text-[48px]">
        {title}
      </h1>
      {subtitle ? <p className="mt-4 max-w-[46ch] text-[15px] leading-7 text-riotTextSecondary">{subtitle}</p> : null}
    </header>
  );
}
