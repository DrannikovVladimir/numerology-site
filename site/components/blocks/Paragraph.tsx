interface ParagraphProps {
  text: string;
}

// Базовый блок — обычный абзац текста
export default function Paragraph({ text }: ParagraphProps) {
  return <p className="text-base leading-relaxed text-slate-800">{text}</p>;
}
