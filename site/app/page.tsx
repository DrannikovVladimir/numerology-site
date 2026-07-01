import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Нумерология — язык чисел, на котором написана ваша жизнь",
  description: "Нумерология онлайн: числа судьбы, матрица судьбы, ангельские числа, совместимость. Разберитесь с нуля или углубитесь в детали.",
  alternates: {
    canonical: "https://example.com/",
  },
  openGraph: {
    title: "Нумерология — язык чисел, на котором написана ваша жизнь",
    description: "Нумерология онлайн: числа судьбы, матрица судьбы, ангельские числа, совместимость. Разберитесь с нуля или углубитесь в детали.",
    url: "https://example.com/",
    siteName: "Нумерология",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Нумерология — язык чисел, на котором написана ваша жизнь",
    description: "Нумерология онлайн: числа судьбы, матрица судьбы, ангельские числа, совместимость.",
  },
};

interface HubCard {
  href: string;
  title: string;
  description: string;
}

const HUBS: HubCard[] = [
  {
    href: "/numerologiya/",
    title: "Нумерология",
    description: "Основы древней науки о числах и их влиянии на судьбу",
  },
  {
    href: "/chislo-sudby/",
    title: "Число судьбы",
    description: "Главное число вашей жизни — путь, предназначение, потенциал",
  },
  {
    href: "/matrica-sudby/",
    title: "Матрица судьбы",
    description: "Психологическая карта личности по дате рождения",
  },
  {
    href: "/kvadrat-pifagora/",
    title: "Квадрат Пифагора",
    description: "Древний метод расчёта характера по цифрам даты рождения",
  },
  {
    href: "/sovmestimost/",
    title: "Совместимость",
    description: "Числовой анализ отношений между партнёрами",
  },
  {
    href: "/numerologiya-imeni/",
    title: "Нумерология имени",
    description: "Как буквы имени формируют судьбу и характер",
  },
  {
    href: "/numerologiya-na-chasakh/",
    title: "Нумерология на часах",
    description: "Значение повторяющихся чисел на циферблате",
  },
  {
    href: "/numerologiya-mesyaca/",
    title: "Нумерология месяца",
    description: "Энергетика каждого месяца года и её влияние на жизнь",
  },
  {
    href: "/angelskie-chisla/",
    title: "Ангельские числа",
    description: "Послания высших сил через повторяющиеся числа",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <section className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-bold text-ink">Нумерология — открой код своей судьбы</h1>
        <p className="text-lg leading-relaxed text-inkMuted">
          Числа сопровождают каждого человека с рождения и хранят в себе скрытые подсказки о
          характере, предназначении и пути. Этот сайт помогает разобраться в основных системах
          нумерологии — от числа судьбы до матрицы личности — и применить их к собственной жизни.
        </p>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HUBS.map((hub) => (
          <Link
            key={hub.href}
            href={hub.href}
            className="rounded-md border border-sand bg-cream p-5 transition-colors hover:border-terracotta"
          >
            <h2 className="text-lg font-semibold text-teal">{hub.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-inkMuted">{hub.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
