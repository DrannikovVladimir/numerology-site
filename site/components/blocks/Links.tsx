import Link from "next/link";

interface LinkItem {
  url: string;
  anchor: string;
  description: string;
}

interface LinksProps {
  title: string;
  items: LinkItem[];
}

// Блок ссылок на связанные статьи — используется в hub-страницах
export default function Links({ title, items }: LinksProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.url} className="font-medium text-indigo-600 hover:underline">
              {item.anchor}
            </Link>
            <span className="text-slate-600"> — {item.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
