import Link from "next/link";

interface BreadcrumbsProps {
  pageType: "hub" | "spoke" | "standalone";
  currentTitle: string;
  parentLink?: { url: string; anchor: string };
}

const LINK_CLASS = "text-terracotta hover:underline";

export default function Breadcrumbs({ pageType, currentTitle, parentLink }: BreadcrumbsProps) {
  const showParent =
    pageType === "spoke" || (pageType === "standalone" && parentLink != null);

  return (
    <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-x-1 text-sm text-inkMuted">
      <Link href="/" className={LINK_CLASS}>Главная</Link>
      {showParent && parentLink && (
        <>
          <span aria-hidden>›</span>
          <Link href={parentLink.url} className={LINK_CLASS}>{parentLink.anchor}</Link>
        </>
      )}
      <span aria-hidden>›</span>
      <span className="text-ink">{currentTitle}</span>
    </nav>
  );
}
