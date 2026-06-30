interface FactRowItem {
  label: string;
  value: string;
}

interface FactRowProps {
  items: FactRowItem[];
}

// Несколько кратких характеристик в ряд — рендерится строкой, не таблицей
export default function FactRow({ items }: FactRowProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-700">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <strong className="font-semibold text-slate-900">{item.label}:</strong>
          <span>{item.value}</span>
          {index < items.length - 1 && <span className="ml-2 text-slate-400">|</span>}
        </span>
      ))}
    </div>
  );
}
