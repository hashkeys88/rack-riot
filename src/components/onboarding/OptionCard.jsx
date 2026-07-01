export default function OptionCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[72px] w-full items-center justify-between border px-5 py-5 text-left transition ${
        selected ? 'border-atelier-ink bg-atelier-citrus shadow-[4px_4px_0_#172119]' : 'border-atelier-ink/20 bg-atelier-paper hover:border-atelier-rust'
      }`}
    >
      <span className="pr-4 text-[17px] font-semibold leading-6 text-riotText">{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-atelier-ink' : 'border-riotBorderDark'
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-atelier-ink' : 'bg-transparent'}`} />
      </span>
    </button>
  );
}
