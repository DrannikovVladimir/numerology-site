interface ListProps {
  style: "ul" | "ol";
  items: string[];
}

// Перечисление однородных элементов: ul — порядок не важен, ol — порядок важен
export default function List({ style, items }: ListProps) {
  const className = "list-inside space-y-1 text-base leading-relaxed text-slate-800";

  if (style === "ol") {
    return (
      <ol className={`list-decimal ${className}`}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className={`list-disc ${className}`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
