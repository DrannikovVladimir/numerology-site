interface FactProps {
  text: string;
}

// Конкретный факт или статистика — выделяется визуально среди абзацев
export default function Fact({ text }: FactProps) {
  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
      <p className="text-base leading-relaxed text-slate-900">{text}</p>
    </div>
  );
}
