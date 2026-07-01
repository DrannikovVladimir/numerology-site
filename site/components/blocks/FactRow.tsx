interface FactRowItem {
  label: string;
  value: string;
}

interface FactRowProps {
  items: FactRowItem[];
}

export default function FactRow({ items }: FactRowProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 border border-sand border-t-[3px] border-t-teal rounded-b-[10px] bg-cream px-4 py-3 text-sm text-inkMuted">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <strong className="font-semibold text-teal">{item.label}:</strong>
          <span>{item.value}</span>
          {index < items.length - 1 && <span className="ml-2 text-inkMuted/50">|</span>}
        </span>
      ))}
    </div>
  );
}
