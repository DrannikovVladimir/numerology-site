interface QuoteProps {
  text: string;
  source?: string;
}

export default function Quote({ text, source }: QuoteProps) {
  return (
    <blockquote className="bg-cream rounded-[10px] px-6 py-5 relative">
      <span
        aria-hidden
        className="absolute top-[-4px] left-[14px] text-[52px] text-teal opacity-30 font-serif leading-none"
      >
        &ldquo;
      </span>
      <p className="italic text-[16px] text-ink leading-relaxed pl-2">{text}</p>
      {source && (
        <cite className="block mt-2 text-[12px] text-inkMuted not-italic pl-2">{source}</cite>
      )}
    </blockquote>
  );
}
