interface CalloutProps {
  variant: "info" | "tip" | "warning";
  text: string;
}

const VARIANT_STYLES: Record<CalloutProps["variant"], string> = {
  info: "border-sky-400 bg-sky-50 text-sky-900",
  tip: "border-emerald-400 bg-emerald-50 text-emerald-900",
  warning: "border-rose-400 bg-rose-50 text-rose-900",
};

// Ограничение системы, важное замечание или предупреждение
export default function Callout({ variant, text }: CalloutProps) {
  return (
    <div className={`rounded-md border-l-4 px-4 py-3 ${VARIANT_STYLES[variant]}`}>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
