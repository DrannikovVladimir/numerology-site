interface H3Props {
  text: string;
}

// Заголовок подраздела
export default function H3({ text }: H3Props) {
  return <h3 className="text-xl font-semibold text-ink">{text}</h3>;
}
