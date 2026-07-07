import Link from "next/link";

interface NumberInfo {
  n: number;
  archetype: string;
  keyword: string;
}

const NUMBERS: NumberInfo[] = [
  { n: 1, archetype: "Лидер", keyword: "Воля" },
  { n: 2, archetype: "Дипломат", keyword: "Партнёрство" },
  { n: 3, archetype: "Творец", keyword: "Творчество" },
  { n: 4, archetype: "Строитель", keyword: "Порядок" },
  { n: 5, archetype: "Искатель", keyword: "Свобода" },
  { n: 6, archetype: "Опекун", keyword: "Забота" },
  { n: 7, archetype: "Мудрец", keyword: "Анализ" },
  { n: 8, archetype: "Магнат", keyword: "Власть" },
  { n: 9, archetype: "Гуманист", keyword: "Мудрость" },
];

// Геометрия колеса: девять точек равномерно по кругу (шаг 40°, старт сверху),
// координаты считаются тригонометрией, а не задаются вручную — так исключается
// риск сместить или задвоить точку при правке
const CX = 250;
const CY = 230;
const RING_R = 110;
const BADGE_R = 19;
const LABEL_R = 158;

export default function NumberWheel() {
  const points = NUMBERS.map((item, i) => {
    const angleDeg = -90 + 40 * i;
    const angleRad = (angleDeg * Math.PI) / 180;
    const badgeX = CX + RING_R * Math.cos(angleRad);
    const badgeY = CY + RING_R * Math.sin(angleRad);
    const labelX = CX + LABEL_R * Math.cos(angleRad);
    const labelY = CY + LABEL_R * Math.sin(angleRad);
    const anchor: "start" | "end" | "middle" =
      labelX > CX + 10 ? "start" : labelX < CX - 10 ? "end" : "middle";
    return { ...item, badgeX, badgeY, labelX, labelY, anchor };
  });

  return (
    <svg
      viewBox="0 0 520 460"
      className="mx-auto w-full max-w-[440px] sm:max-w-none"
      role="img"
      aria-label="Колесо чисел от 1 до 9 с архетипами и ключевыми словами каждого числа"
    >
      <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#E0C9A0" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={6} fill="#1B4D4A" />
      {points.map((p) => (
        <Link key={p.n} href={`/chislo-sudby/${p.n}/`} legacyBehavior>
          <g className="cursor-pointer transition-opacity hover:opacity-80">
          <line
            x1={p.badgeX}
            y1={p.badgeY}
            x2={p.labelX}
            y2={p.labelY}
            stroke="#E0C9A0"
            strokeWidth={1}
          />
          <circle cx={p.badgeX} cy={p.badgeY} r={BADGE_R} fill="#1B4D4A" />
          <text
            x={p.badgeX}
            y={p.badgeY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={15}
            fontWeight={500}
            fill="#FBF3E3"
          >
            {p.n}
          </text>
          <text
            x={p.labelX}
            y={p.labelY}
            textAnchor={p.anchor}
            fontSize={13}
            fontWeight={600}
            fill="#3D2B1F"
          >
            {p.archetype}
          </text>
          <text
            x={p.labelX}
            y={p.labelY + 14}
            textAnchor={p.anchor}
            fontSize={11}
            fill="#6B5A47"
          >
            {p.keyword}
          </text>
    </g>
  </Link>
      ))}
    </svg>
  );
}
