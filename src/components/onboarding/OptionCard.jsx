export default function OptionCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[72px] w-full items-center justify-between rounded-xl border px-5 py-5 text-left transition ${
        selected ? 'border-black bg-white shadow-[0_6px_16px_rgba(0,0,0,0.06)]' : 'border-riotBorder bg-white hover:border-black'
      }`}
    >
      <span className="pr-4 text-[17px] font-semibold leading-6 text-riotText">{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-black' : 'border-riotBorderDark'
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-black' : 'bg-transparent'}`} />
      </span>
    </button>
  );
}
