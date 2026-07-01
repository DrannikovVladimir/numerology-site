import Link from "next/link";
import { Fragment } from "react";

interface ParagraphProps {
  text: string;
}

const MD_LINK = /\[([^\]]+)\]\(((?:\/|http)[^)]+)\)/g;
const LINK_CLASS = "text-terracotta hover:underline";

function parseText(text: string) {
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MD_LINK.lastIndex = 0;
  while ((match = MD_LINK.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const [, label, url] = match;
    if (url.startsWith("/")) {
      parts.push(
        <Link key={match.index} href={url} className={LINK_CLASS}>
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a key={match.index} href={url} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function Paragraph({ text }: ParagraphProps) {
  const parts = parseText(text);

  if (parts.length === 1 && typeof parts[0] === "string") {
    return <p className="text-base leading-relaxed text-ink">{parts[0]}</p>;
  }

  return (
    <p className="text-base leading-relaxed text-ink">
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </p>
  );
}
