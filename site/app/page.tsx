import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Hash, Calendar, Compass, BookOpen, Star, Grid3x3, Square, HeartHandshake, Type, Clock, CalendarDays, Sparkles, LucideIcon } from "lucide-react";
import DestinyCalculator from "@/components/DestinyCalculator";
import NumberWheel from "@/components/NumberWheel";
import PsychomatrixCalculator from "@/components/PsychomatrixCalculator";
import Cta from "@/components/blocks/Cta";

export const metadata: Metadata = {
  title: "Нумерология — язык чисел, на котором написана ваша жизнь",
  description: "Нумерология онлайн: числа судьбы, матрица судьбы, ангельские числа, совместимость. Разберитесь с нуля или углубитесь в детали.",
  alternates: {
    canonical: "https://chislavlasti.com/",
  },
  openGraph: {
    title: "Нумерология — язык чисел, на котором написана ваша жизнь",
    description: "Нумерология онлайн: числа судьбы, матрица судьбы, ангельские числа, совместимость. Разберитесь с нуля или углубитесь в детали.",
    url: "https://chislavlasti.com/",
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
  icon: LucideIcon;
}

const HUBS: HubCard[] = [
  {
    href: "/numerologiya/",
    title: "Нумерология",
    description: "Основы древней науки о числах и их влиянии на судьбу",
    icon: BookOpen,
  },
  {
    href: "/chislo-sudby/",
    title: "Число судьбы",
    description: "Главное число вашей жизни — путь, предназначение, потенциал",
    icon: Star,
  },
  {
    href: "/matrica-sudby/",
    title: "Матрица судьбы",
    description: "Психологическая карта личности по дате рождения",
    icon: Grid3x3,
  },
  {
    href: "/kvadrat-pifagora/",
    title: "Квадрат Пифагора",
    description: "Древний метод расчёта характера по цифрам даты рождения",
    icon: Square,
  },
  {
    href: "/sovmestimost/",
    title: "Совместимость",
    description: "Числовой анализ отношений между партнёрами",
    icon: HeartHandshake,
  },
  {
    href: "/numerologiya-imeni/",
    title: "Нумерология имени",
    description: "Как буквы имени формируют судьбу и характер",
    icon: Type,
  },
  {
    href: "/numerologiya-na-chasakh/",
    title: "Нумерология на часах",
    description: "Значение повторяющихся чисел на циферблате",
    icon: Clock,
  },
  {
    href: "/numerologiya-mesyaca/",
    title: "Нумерология месяца",
    description: "Энергетика каждого месяца года и её влияние на жизнь",
    icon: CalendarDays,
  },
  {
    href: "/angelskie-chisla/",
    title: "Ангельские числа",
    description: "Послания высших сил через повторяющиеся числа",
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <section className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-ink">Нумерология — открой код своей судьбы</h1>
          <p className="text-base text-inkMuted">
            Что скрывает дата вашего рождения? Нумерология переводит числа на язык характера и судьбы.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href="https://t.me/numerolog_master_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-terracotta px-6 py-3 font-medium text-cream hover:opacity-90"
            >
              Узнать своё число
            </a>
            <a
              href="#hubs"
              className="rounded-md border border-terracotta px-6 py-3 font-medium text-terracotta hover:bg-terracotta/5"
            >
              Изучить основы
            </a>
          </div>
        </div>
        <div className="w-full max-w-[320px] flex-shrink-0">
          <Image
            src="/images/hero/hero-visual.png"
            alt="Мистический символ нумерологии — числа от 1 до 9"
            width={320}
            height={320}
            className="mx-auto rounded-2xl"
            priority
          />
        </div>
      </section>      

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-ink">
          Что такое числа в нумерологии
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-inkMuted">
          Разбираемся в основах нумерологии простыми словами — без эзотерики и сложных терминов
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="relative rounded-2xl bg-cream p-5 pt-6">
            <div className="absolute -top-3.5 left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-teal shadow-[0_0_0_4px_#F2E4C9]">
              <Hash className="h-5 w-5 text-cream" />
            </div>
            <h3 className="mt-4 text-[17px] font-medium text-ink">
              Каждое число — характеристика
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-inkMuted">
              Числа от 1 до 9 несут устойчивый набор черт — как темперамент в психологии.
            </p>
          </div>
          <div className="relative rounded-2xl bg-cream p-5 pt-6">
            <div className="absolute -top-3.5 left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-teal shadow-[0_0_0_4px_#F2E4C9]">
              <Calendar className="h-5 w-5 text-cream" />
            </div>
            <h3 className="mt-4 text-[17px] font-medium text-ink">
              Дата рождения — расчётная основа
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-inkMuted">
              Сложив цифры даты, получают одно число, которое сохраняется всю жизнь.
            </p>
          </div>
          <div className="relative rounded-2xl bg-cream p-5 pt-6">
            <div className="absolute -top-3.5 left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-teal shadow-[0_0_0_4px_#F2E4C9]">
              <Compass className="h-5 w-5 text-cream" />
            </div>
            <h3 className="mt-4 text-[17px] font-medium text-ink">
              Число — ориентир, не приговор
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-inkMuted">
              Расшифровка показывает сильные стороны и зоны роста, а не предопределяет исход.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[20px] bg-ink px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
        <svg
          className="pointer-events-none absolute -right-10 -top-10 opacity-[0.12]"
          width="180"
          height="180"
          viewBox="0 0 180 180"
          aria-hidden="true"
        >
          <circle cx="90" cy="90" r="85" stroke="#F2E4C9" strokeWidth="1.5" fill="none" />
          <circle cx="90" cy="90" r="62" stroke="#F2E4C9" strokeWidth="1" fill="none" />
          <circle cx="90" cy="90" r="40" stroke="#F2E4C9" strokeWidth="1" fill="none" />
        </svg>
        <svg
          className="pointer-events-none absolute -bottom-8 -left-8 opacity-[0.08]"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="55" stroke="#F2E4C9" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="60" r="35" stroke="#F2E4C9" strokeWidth="1" fill="none" />
        </svg>
        <div className="relative">
          <h2 className="text-center text-2xl font-bold text-cream">
            Матрица судьбы по дате рождения
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-[#C9A876]">
            Тот же метод известен и как{" "}
            <Link href="/kvadrat-pifagora/" className="text-[#F0D5C4] hover:underline">
              квадрат Пифагора
            </Link>
          </p>
          <div className="mt-8">
            <PsychomatrixCalculator />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mt-12 text-center text-2xl font-bold text-ink">
          Разделы нумерологии
        </h2>
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-inkMuted mt-3">
          Ниже — девять направлений нумерологии, от числа судьбы до матрицы личности. Разберитесь в
          основах или сразу переходите к тому, что интересно именно вам.
        </p>

        <div id="hubs" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HUBS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="rounded-md border border-sand bg-cream p-5 transition-colors hover:border-terracotta"
            >
              <div className="flex items-center gap-2">
                <hub.icon className="h-[18px] w-[18px] text-teal" />
                <h2 className="text-lg font-semibold text-teal">{hub.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-inkMuted">{hub.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[20px] bg-teal px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
        <svg
          className="pointer-events-none absolute -right-10 -top-10 opacity-[0.15]"
          width="180"
          height="180"
          viewBox="0 0 180 180"
          aria-hidden="true"
        >
          <circle cx="90" cy="90" r="85" stroke="#FBF3E3" strokeWidth="1.5" fill="none" />
          <circle cx="90" cy="90" r="62" stroke="#FBF3E3" strokeWidth="1" fill="none" />
          <circle cx="90" cy="90" r="40" stroke="#FBF3E3" strokeWidth="1" fill="none" />
        </svg>
        <svg
          className="pointer-events-none absolute -bottom-8 -left-8 opacity-10"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="55" stroke="#FBF3E3" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="60" r="35" stroke="#FBF3E3" strokeWidth="1" fill="none" />
        </svg>
        <div className="relative">
          <h2 className="text-center text-2xl font-bold text-cream">
            Рассчитать число судьбы прямо сейчас
          </h2>
          <div className="mt-8">
            <DestinyCalculator />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-ink">Что расскажет о вас нумерология</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-inkMuted">
          От характера до здоровья — что именно раскрывает ваша дата рождения
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-character.png" alt="Характер" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Характер</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Сильные стороны, слепые зоны и то, как вы принимаете решения — портрет личности, зашифрованный в дате рождения</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-purpose.png" alt="Предназначение" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Предназначение</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Ваш жизненный путь и предназначение — к чему вы предрасположены и куда стоит направить усилия</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-compatibility.png" alt="Совместимость" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Совместимость</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Совместимость по нумерологии — как ваши числа сочетаются с партнёром в отношениях, работе и семье</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-money.png" alt="Деньги" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Деньги</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Отношения с деньгами, финансовый потенциал и периоды, когда капитал копится легче</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-love.png" alt="Любовь" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Любовь</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Как вы проявляетесь в близких отношениях — что цените, чего избегаете, с кем совпадаете по характеру</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image src="/images/home/icon-health.png" alt="Здоровье" width={200} height={200} className="h-auto w-28 sm:w-36 lg:w-44" />
            <h3 className="mt-4 text-[15px] font-medium text-ink">Здоровье</h3>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted">Энергетика тела, зоны уязвимости и на что обратить внимание, чтобы поддерживать баланс</p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-ink">
          Девять чисел — девять характеров
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-inkMuted">
          У каждого числа судьбы — от 1 до 9 — свой архетип и ключевая черта характера
        </p>
        <div className="mt-8">
          <NumberWheel />
        </div>
      </section>

      <section className="mt-16">
        <Cta
          position="mid_article_channel"
          heading="Свежие разборы чисел — в Telegram-канале"
          subtext="Публикуем материалы о нумерологии чаще, чем успеваем оформить в статьи на сайте"
          button_text="Подписаться на канал"
          url="https://t.me/chisla_vlasti"
        />
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-ink">
          Что означают зеркальные числа на часах
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-inkMuted">
          Три примера того, как нумерология на часах расшифровывает повторяющиеся цифры
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[14px] bg-cream p-4">
            <div className="rounded-lg bg-ink py-2.5 text-center">
              <span className="font-mono text-2xl font-bold tracking-widest text-cream">
                00:00
              </span>
            </div>
            <p className="mt-2.5 text-center text-[11px] font-semibold text-teal">
              Переход · пустота · чистый лист
            </p>
            <p className="mt-2 text-center text-xs leading-relaxed text-inkMuted">
              Всё завершилось — можно начать заново
            </p>
          </div>
          <div className="rounded-[14px] bg-cream p-4">
            <div className="rounded-lg bg-ink py-2.5 text-center">
              <span className="font-mono text-2xl font-bold tracking-widest text-cream">
                11:11
              </span>
            </div>
            <p className="mt-2.5 text-center text-[11px] font-semibold text-teal">
              Интуиция · синхроничность · портал
            </p>
            <p className="mt-2 text-center text-xs leading-relaxed text-inkMuted">
              Вселенная подтверждает — вы на правильном пути
            </p>
          </div>
          <div className="rounded-[14px] bg-cream p-4">
            <div className="rounded-lg bg-ink py-2.5 text-center">
              <span className="font-mono text-2xl font-bold tracking-widest text-cream">
                22:22
              </span>
            </div>
            <p className="mt-2.5 text-center text-[11px] font-semibold text-teal">
              Строитель · воплощение идей
            </p>
            <p className="mt-2 text-center text-xs leading-relaxed text-inkMuted">
              Пора воплощать задуманное в реальность
            </p>
          </div>
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/numerologiya-na-chasakh/"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            Смотреть все зеркальные времена →
          </Link>
        </div>
      </section>
    </main>
  );
}
