"use client";

import { useState } from "react";
import Link from "next/link";

const SPHERES: Record<number, string> = {
  1: "воля",
  2: "энергетика",
  3: "познание",
  4: "здоровье",
  5: "логика",
  6: "труд",
  7: "везение",
  8: "долг",
  9: "память",
};

// Раскладка психоматрицы сверху вниз: Дух (7-8-9), Душа (4-5-6), Тело (1-2-3)
const GRID_ORDER = [7, 8, 9, 4, 5, 6, 1, 2, 3];

function sumDigitsOfNumber(n: number): number {
  return String(n)
    .split("")
    .reduce((sum, d) => sum + Number(d), 0);
}

// Точное зеркало calcPythagoreanMatrix() из src/bot/interpretations/karma/karma.js —
// любые правки формулы делать синхронно в обоих местах
function computePsychomatrix(dateStr: string): Record<number, number> {
  // dateStr из <input type="date"> приходит как YYYY-MM-DD
  const [year, month, day] = dateStr.split("-");
  const fullDateDigits = (day + month + year).split("").map(Number);

  // Первая ненулевая цифра дня — для дня "01" это 1, а не 0
  const firstNonZeroDayDigit = Number(day.split("").find((d) => d !== "0") ?? "0");

  const A = fullDateDigits.reduce((sum, d) => sum + d, 0);
  const B = sumDigitsOfNumber(A);
  const C = A - firstNonZeroDayDigit * 2;
  const D = C <= 0 ? 0 : sumDigitsOfNumber(C);

  const pool: number[] = [
    ...fullDateDigits,
    ...String(A).split("").map(Number),
    ...String(B).split("").map(Number),
    ...(C > 0 ? String(C).split("").map(Number) : []),
    ...(D > 0 ? String(D).split("").map(Number) : []),
  ].filter((d) => d !== 0);

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  pool.forEach((d) => {
    if (d >= 1 && d <= 9) counts[d] += 1;
  });
  return counts;
}

export default function PsychomatrixCalculator() {
  const [date, setDate] = useState("");
  const [counts, setCounts] = useState<Record<number, number> | null>(null);

  function handleCalculate() {
    if (!date) return;
    setCounts(computePsychomatrix(date));
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <input
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

      {counts && (
        <>
          <div className="mx-auto mt-6 grid max-w-[280px] grid-cols-3 gap-2">
            {GRID_ORDER.map((digit) => {
              const count = counts[digit];
              return (
                <div
                  key={digit}
                  className={`rounded-lg border p-3 ${
                    count > 0 ? "border-sand bg-cream" : "border-dashed border-sand bg-cream"
                  }`}
                >
                  <div className={`font-mono text-lg font-semibold ${count > 0 ? "text-teal" : "text-sand"}`}>
                    {count > 0 ? digit : "—"}
                  </div>
                  {count > 0 && <div className="text-[10px] text-inkMuted">×{count}</div>}
                  <div className="mt-0.5 text-[9px] text-inkMuted">{SPHERES[digit]}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <Link href="/matrica-sudby/" className="text-sm font-medium text-[#F0D5C4] hover:underline">
              Полная расшифровка каждой ячейки →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
