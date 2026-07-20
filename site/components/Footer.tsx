import Link from "next/link";

const HUBS = [
  { href: "/numerologiya/", label: "Нумерология" },
  { href: "/chislo-sudby/", label: "Число судьбы" },
  { href: "/matrica-sudby/", label: "Матрица судьбы" },
  { href: "/kvadrat-pifagora/", label: "Квадрат Пифагора" },
  { href: "/sovmestimost/", label: "Совместимость" },
  { href: "/numerologiya-imeni/", label: "Нумерология имени" },
  { href: "/numerologiya-na-chasakh/", label: "Нумерология на часах" },
  { href: "/numerologiya-mesyaca/", label: "Нумерология месяца" },
  { href: "/angelskie-chisla/", label: "Ангельские числа" },
];

export default function Footer() {
  return (
    <footer className="border-t border-sand bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <nav className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {HUBS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="text-sm text-inkMuted hover:text-terracotta"
            >
              {hub.label}
            </Link>
          ))}
        </nav>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-sand pt-6">
          <Link
            href="/karta-sajta/"
            className="text-sm text-inkMuted hover:text-terracotta"
          >
            Карта сайта
          </Link>
          <Link
            href="/politika-konfidencialnosti/"
            className="text-sm text-inkMuted hover:text-terracotta"
          >
            Политика конфиденциальности
          </Link>
          <Link
            href="/polzovatelskoe-soglashenie/"
            className="text-sm text-inkMuted hover:text-terracotta"
          >
            Пользовательское соглашение
          </Link>
        </nav>
        <p className="mt-8 text-sm text-inkMuted">© 2026 Нумерология. Все права защищены.</p>
      </div>
    </footer>
  );
}