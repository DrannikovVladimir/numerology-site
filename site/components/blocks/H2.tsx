interface H2Props {
  text: string;
  lead: string;
}

// Заголовок раздела с обязательным эмоциональным абзацем после него
export default function H2({ text, lead }: H2Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-900">{text}</h2>
      <p className="text-lg leading-relaxed text-slate-700">{lead}</p>
    </div>
  );
}
