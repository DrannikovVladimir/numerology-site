interface CtaProps {
  position: "after_intro" | "end_of_article";
}

const CTA_TEXT: Record<CtaProps["position"], string> = {
  after_intro: "Узнать своё число судьбы",
  end_of_article: "Рассчитать полную нумерологическую карту",
};

// Призыв к действию — текст зависит от позиции блока в статье
export default function Cta({ position }: CtaProps) {
  return (
    <div className="rounded-md bg-indigo-600 px-6 py-4 text-center">
      <a href="#" className="text-base font-semibold text-white">
        {CTA_TEXT[position]}
      </a>
    </div>
  );
}
