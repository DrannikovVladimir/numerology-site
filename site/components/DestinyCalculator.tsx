"use client";

import { useState } from "react";
import Cta from "@/components/blocks/Cta";

interface DestinyNumberInfo {
  archetype: string;
  line: string;
  master?: boolean;
}

const DESTINY_NUMBERS: Record<number, DestinyNumberInfo> = {
  1: { archetype: "Лидер", line: "Путь первопроходца" },
  2: { archetype: "Дипломат", line: "Путь партнёрства и баланса" },
  3: { archetype: "Творец", line: "Путь самовыражения и радости" },
  4: { archetype: "Строитель", line: "Путь созидания и порядка" },
  5: { archetype: "Искатель", line: "Путь свободы и перемен" },
  6: { archetype: "Опекун", line: "Путь любви и ответственности" },
  7: { archetype: "Мудрец", line: "Путь познания и внутренней мудрости" },
  8: { archetype: "Магнат", line: "Путь власти и материальной реализации" },
  9: { archetype: "Гуманист", line: "Путь мудрости и служения" },
  11: { archetype: "Пророк", line: "Путь вдохновения и высшей интуиции", master: true },
  22: { archetype: "Мастер-строитель", line: "Путь грандиозного созидания", master: true },
  33: { archetype: "Учитель", line: "Путь высшего служения и любви", master: true },
};

// Складываем все цифры даты и сворачиваем до одной цифры,
// останавливаясь на мастер-числах 11, 22, 33, если сумма совпала с ними на промежуточном шаге
function reduceToDestinyNumber(dateStr: string): number {
  const sumDigits = (value: string) =>
    value
      .replace(/\D/g, "")
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);

  let n = sumDigits(dateStr);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = sumDigits(String(n));
  }
  return n;
}

export default function DestinyCalculator() {
  const [date, setDate] = useState("");
  const [result, setResult] = useState<number | null>(null);

  function handleCalculate() {
    if (!date) return;
    setResult(reduceToDestinyNumber(date));
  }

  const data = result !== null ? DESTINY_NUMBERS[result] : null;

  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <label htmlFor="birth-date" className="text-sm font-medium text-cream">
          Дата рождения
        </label>
        <input
          id="birth-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-sand bg-cream px-4 py-2 text-sm text-ink"
        />
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!date}
          className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-cream disabled:opacity-50"
        >
          Рассчитать
        </button>
      </div>

      {data && (
        <>
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-cream p-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-teal text-2xl font-medium text-cream">
              {result}
            </div>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
                {data.archetype}
                {data.master && (
                  <span className="rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
                    Мастер-число
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-inkMuted">{data.line}</p>
            </div>
          </div>

          <div className="mt-4">
            <Cta
              position="after_calculation"
              heading="Хотите полный разбор своего числа?"
              subtext="Бот сложит все системы нумерологии и пришлёт подробную расшифровку характера и пути"
              button_text="Открыть бота"
              url="https://t.me/numerolog_master_bot"
            />
          </div>
        </>
      )}
    </div>
  );
}
