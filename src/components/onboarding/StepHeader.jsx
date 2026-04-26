export default function StepHeader({ title, subtitle, step, onBack }) {
  return (
    <header>
      <div className="mb-6 min-h-[20px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium uppercase tracking-[0.12em] text-riotTextSecondary transition hover:text-riotText"
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
          <div key={item} className={`h-2 rounded-full ${item <= step.current ? 'bg-black' : 'bg-riotBorder'}`} />
        ))}
      </div>

      <h1 className="max-w-[14ch] text-[30px] font-bold leading-[1.05] text-riotText md:text-[36px]">
        {title}
      </h1>
      {subtitle ? <p className="mt-4 max-w-[46ch] text-[15px] leading-7 text-riotTextSecondary">{subtitle}</p> : null}
    </header>
  );
}
