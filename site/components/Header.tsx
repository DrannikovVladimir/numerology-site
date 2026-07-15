"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/chislo-sudby/", label: "Число судьбы" },
  { href: "/sovmestimost/", label: "Совместимость" },
  { href: "/matrica-sudby/", label: "Матрица судьбы" },
  { href: "/angelskie-chisla/", label: "Ангельские числа" },
];

const MOBILE_NAV_LINKS = [
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

function LabyrinthIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" />
      <circle cx="80" cy="80" r="50" stroke="currentColor" strokeWidth="10" />
      <circle cx="80" cy="80" r="28" stroke="currentColor" strokeWidth="8" />
      <line x1="80" y1="8" x2="80" y2="42" stroke="currentColor" strokeWidth="8" />
      <line x1="80" y1="118" x2="80" y2="152" stroke="currentColor" strokeWidth="8" />
      <line x1="8" y1="80" x2="42" y2="80" stroke="currentColor" strokeWidth="8" />
      <line x1="118" y1="80" x2="152" y2="80" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-cream">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-terracotta">
          <LabyrinthIcon />
          Нумерология
        </Link>

        <nav className="hidden gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink hover:text-terracotta"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="text-xl text-ink sm:hidden"
          aria-label="Открыть меню"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-sand px-4 py-3 sm:hidden">
          {MOBILE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="py-2 text-sm font-medium text-ink hover:text-terracotta"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
