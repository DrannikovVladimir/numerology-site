interface CtaProps {
  text: string;
  url: string;
  position?: "after_intro" | "after_calculation" | "end_of_article";
}

// Призыв к действию — текст и ссылка приходят из контента, ведут на Telegram-бота
export default function Cta({ text, url }: CtaProps) {
  return (
    <div className="rounded-md bg-terracotta px-6 py-4 text-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base font-semibold text-cream"
      >
        {text}
      </a>
    </div>
  );
}
