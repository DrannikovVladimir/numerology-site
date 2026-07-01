interface CalloutProps {
  variant: "info" | "tip" | "warning";
  text: string;
}

const VARIANT_CONFIG: Record<
  CalloutProps["variant"],
  { wrapperClass: string; labelClass: string; textClass: string; label: string }
> = {
  tip: {
    wrapperClass: "border-[#3B6D11] bg-[#EAF3DE]",
    labelClass: "bg-[#3B6D11] text-white",
    textClass: "text-[#27500A]",
    label: "Совет",
  },
  info: {
    wrapperClass: "border-teal bg-teal-light",
    labelClass: "bg-teal text-cream",
    textClass: "text-teal",
    label: "Важно знать",
  },
  warning: {
    wrapperClass: "border-terracotta bg-terracotta-light",
    labelClass: "bg-terracotta text-cream",
    textClass: "text-terracotta",
    label: "Внимание",
  },
};

export default function Callout({ variant, text }: CalloutProps) {
  const { wrapperClass, labelClass, textClass, label } = VARIANT_CONFIG[variant];
  return (
    <div className={`border-l-4 rounded-r-[8px] rounded-l-none px-[18px] py-[14px] ${wrapperClass}`}>
      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block ${labelClass}`}>
        {label}
      </span>
      <p className={`text-base leading-relaxed ${textClass}`}>{text}</p>
    </div>
  );
}
