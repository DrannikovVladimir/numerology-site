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
        <details key={index} className="rounded-md border border-sand bg-cream px-4 py-3">
          <summary className="cursor-pointer font-semibold text-ink">
            {item.question}
          </summary>
          <p className="mt-2 text-base leading-relaxed text-inkMuted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
