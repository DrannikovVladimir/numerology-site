interface FactProps {
  text: string;
}

// Конкретный факт или статистика — выделяется визуально среди абзацев
export default function Fact({ text }: FactProps) {
  return (
    <div className="rounded-md border-l-4 border-terracotta bg-terracotta-light px-4 py-3">
      <p className="text-base leading-relaxed text-ink">{text}</p>
    </div>
  );
}
