import { slugify } from "@/lib/slugify";

interface H2Props {
  text: string;
  lead: string;
}

// Заголовок раздела с якорем и обязательным эмоциональным абзацем после него
export default function H2({ text, lead }: H2Props) {
  const id = slugify(text);
  return (
    <div className="space-y-3">
      <h2 id={id} className="group flex items-center gap-2 text-2xl font-bold text-teal">
        {text}
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-lg font-normal text-teal/50 transition-opacity"
          aria-label="Ссылка на раздел"
        >
          #
        </a>
      </h2>
      <p className="text-lg leading-relaxed text-inkMuted">{lead}</p>
    </div>
  );
}
