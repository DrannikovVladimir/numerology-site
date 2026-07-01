interface CtaProps {
  position: "after_intro" | "after_calculation" | "end_of_article" | "mid_article_channel";
  heading: string;
  subtext: string;
  button_text: string;
  url: string;
}

function SvgChannel() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-10"
      aria-hidden
    >
      <circle cx="80" cy="80" r="78" stroke="#CDE8E4" strokeWidth="3" />
      <circle cx="80" cy="80" r="60" stroke="#CDE8E4" strokeWidth="3" />
      <circle cx="80" cy="80" r="42" stroke="#CDE8E4" strokeWidth="3" />
      <circle cx="80" cy="80" r="24" stroke="#CDE8E4" strokeWidth="3" />
      <circle cx="80" cy="80" r="8" fill="#CDE8E4" />
    </svg>
  );
}

function SvgLabyrinth() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-10"
      aria-hidden
    >
      <circle cx="80" cy="80" r="72" stroke="#F2E4C9" strokeWidth="12" />
      <circle cx="80" cy="80" r="50" stroke="#F2E4C9" strokeWidth="10" />
      <circle cx="80" cy="80" r="28" stroke="#F2E4C9" strokeWidth="8" />
      <line x1="80" y1="8"  x2="80" y2="42"  stroke="#F2E4C9" strokeWidth="8" />
      <line x1="80" y1="118" x2="80" y2="152" stroke="#F2E4C9" strokeWidth="8" />
      <line x1="8"  y1="80" x2="42"  y2="80" stroke="#F2E4C9" strokeWidth="8" />
      <line x1="118" y1="80" x2="152" y2="80" stroke="#F2E4C9" strokeWidth="8" />
    </svg>
  );
}

export default function Cta({ position, heading, subtext, button_text, url }: CtaProps) {
  const isChannel = position === "mid_article_channel";

  const bg = isChannel ? "#1B4D4A" : "#3D2B1F";
  const headingColor = "text-[#F2E4C9]";
  const subtextColor = isChannel ? "text-[#9FD4C8]" : "text-[#C9A876]";
  const btnClass = isChannel
    ? "bg-[#F2E4C9] text-[#1B4D4A]"
    : "bg-[#7A3418] text-[#F2E4C9]";

  return (
    <div
      className="rounded-xl overflow-hidden relative px-7 py-6 flex items-center gap-5"
      style={{ backgroundColor: bg }}
    >
      {isChannel ? <SvgChannel /> : <SvgLabyrinth />}
      <div className="flex-1 relative z-10">
        <p className={`text-[17px] font-medium mb-1 ${headingColor}`}>{heading}</p>
        <p className={`text-[13px] mb-3 leading-relaxed ${subtextColor}`}>{subtext}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[13px] font-medium px-[18px] py-2 rounded-md inline-block ${btnClass}`}
        >
          {button_text}
        </a>
      </div>
    </div>
  );
}
