interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  items: FaqItem[];
}

// Список вопросов и ответов в конце статьи
export default function Faq({ items }: FaqProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details key={index} className="rounded-md border border-slate-200 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-slate-900">
            {item.question}
          </summary>
          <p className="mt-2 text-base leading-relaxed text-slate-700">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
