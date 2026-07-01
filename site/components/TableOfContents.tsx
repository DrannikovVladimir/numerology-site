import { slugify } from "@/lib/slugify";
import type { Block } from "@/components/blocks/BlockRenderer";

interface TableOfContentsProps {
  blocks: Block[];
}

export default function TableOfContents({ blocks }: TableOfContentsProps) {
  const headings = blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ text: b.text, id: slugify(b.text) }));

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-md border border-sand bg-cream px-5 py-4">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-inkMuted">
        Содержание
      </p>
      <ol className="space-y-1.5 list-decimal list-inside">
        {headings.map(({ text, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="text-teal hover:text-terracotta transition-colors text-sm"
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
