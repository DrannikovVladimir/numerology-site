import { slugify } from "@/lib/slugify";

interface H3Props {
  text: string;
}

// Заголовок подраздела с якорем
export default function H3({ text }: H3Props) {
  const id = slugify(text);
  return (
    <h3 id={id} className="group flex items-center gap-2 text-xl font-semibold text-ink">
      {text}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 text-base font-normal text-ink/40 transition-opacity"
        aria-label="Ссылка на подраздел"
      >
        #
      </a>
    </h3>
  );
}
