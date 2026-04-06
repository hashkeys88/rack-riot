export default function StepIndicator({ step, total }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }, (_, idx) => idx + 1).map((number) => (
        <div key={number} className={`h-2 flex-1 rounded-full ${number <= step ? 'bg-riotAccent' : 'bg-white/15'}`} />
      ))}
    </div>
  );
}
