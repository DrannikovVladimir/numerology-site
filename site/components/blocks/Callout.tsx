interface CalloutProps {
  variant: "info" | "tip" | "warning";
  text: string;
}

const VARIANT_STYLES: Record<CalloutProps["variant"], string> = {
  info: "border-teal bg-teal-light text-ink",
  tip: "border-green-400 bg-green-50 text-ink",
  warning: "border-terracotta bg-terracotta-light text-ink",
};

// Ограничение системы, важное замечание или предупреждение
export default function Callout({ variant, text }: CalloutProps) {
  return (
    <div className={`rounded-md border-l-4 px-4 py-3 ${VARIANT_STYLES[variant]}`}>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
