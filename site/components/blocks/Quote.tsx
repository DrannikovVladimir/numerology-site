interface QuoteProps {
  text: string;
  source?: string;
}

// Сильное утверждение или цитата — эмоциональный якорь раздела
export default function Quote({ text, source }: QuoteProps) {
  return (
    <blockquote className="rounded-md border-l-4 border-teal bg-teal-light px-4 py-3 italic text-ink">
      <p className="text-lg leading-relaxed">{text}</p>
      {source && <cite className="mt-2 block text-sm not-italic text-inkMuted">{source}</cite>}
    </blockquote>
  );
}
