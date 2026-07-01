interface FactProps {
  text: string;
}

export default function Fact({ text }: FactProps) {
  return (
    <div className="border-[1.5px] border-terracotta rounded-[10px] bg-cream px-4 py-3">
      <span className="bg-terracotta text-cream text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block">
        Факт
      </span>
      <p className="text-base leading-relaxed text-ink">{text}</p>
    </div>
  );
}
