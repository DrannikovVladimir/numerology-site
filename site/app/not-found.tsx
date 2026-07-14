import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

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

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-ink">Страница не найдена</h1>
      <p className="text-lg text-inkMuted">
        Такой страницы не существует — возможно, она была перемещена или ещё не опубликована.
      </p>
      <Link
        href="/"
        className="rounded-md bg-terracotta px-6 py-3 text-base font-semibold text-cream"
      >
        На главную
      </Link>

      <section className="mt-12 w-full">
        <h2 className="mb-4 text-xl font-semibold text-ink">Возможно, вас заинтересует:</h2>
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
      </section>
    </main>
  );
}
