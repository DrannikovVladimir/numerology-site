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
    <div className="flex flex-wrap gap-x-2 gap-y-1 rounded-md border border-sand bg-cream px-4 py-3 text-sm text-inkMuted">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <strong className="font-semibold text-ink">{item.label}:</strong>
          <span>{item.value}</span>
          {index < items.length - 1 && <span className="ml-2 text-inkMuted/50">|</span>}
        </span>
      ))}
    </div>
  );
}
