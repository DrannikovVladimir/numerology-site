interface H2Props {
  text: string;
  lead: string;
}

// Заголовок раздела с обязательным эмоциональным абзацем после него
export default function H2({ text, lead }: H2Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-teal">{text}</h2>
      <p className="text-lg leading-relaxed text-inkMuted">{lead}</p>
    </div>
  );
}
