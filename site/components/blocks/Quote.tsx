interface QuoteProps {
  text: string;
  source?: string;
}

// Сильное утверждение или цитата — эмоциональный якорь раздела
export default function Quote({ text, source }: QuoteProps) {
  return (
    <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-slate-700">
      <p className="text-lg leading-relaxed">{text}</p>
      {source && <cite className="mt-2 block text-sm not-italic text-slate-500">{source}</cite>}
    </blockquote>
  );
}
