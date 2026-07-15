const DOMAIN = "https://example.com";
const SITE_NAME = "Нумерология";

interface ArticleForJsonLd {
  url?: string;
  image?: string;
  meta: { h1: string; description: string };
  nav_title?: string;
  page_type: string;
  internal_links?: { up?: { url: string; anchor: string } | null };
  faq?: { question: string; answer: string }[];
  date_published?: string;
  date_modified?: string;
}

export function buildJsonLd(article: ArticleForJsonLd): object {
  const today = new Date().toISOString().slice(0, 10);
  const pageUrl = article.url ? `${DOMAIN}${article.url}` : DOMAIN;
  const datePublished = article.date_published ?? today;
  const dateModified = article.date_modified ?? today;
  const up = article.internal_links?.up;

  // BreadcrumbList — глубина зависит от page_type и наличия internal_links.up
  const breadcrumbItems: object[] = [
    { "@type": "ListItem", position: 1, name: "Главная", item: `${DOMAIN}/` },
  ];

  if ((article.page_type === "spoke" || article.page_type === "standalone") && up) {
    breadcrumbItems.push(
      { "@type": "ListItem", position: 2, name: up.anchor, item: `${DOMAIN}${up.url}` },
      { "@type": "ListItem", position: 3, name: article.nav_title ?? article.meta.h1, item: pageUrl }
    );
  } else {
    breadcrumbItems.push(
      { "@type": "ListItem", position: 2, name: article.nav_title ?? article.meta.h1, item: pageUrl }
    );
  }

  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: `${DOMAIN}/images/logo.png` },
  };

const articleNode: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: article.meta.h1,
    description: article.meta.description,
    url: pageUrl,
    inLanguage: "ru",
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher,
    mainEntityOfPage: pageUrl,
  };

  if (article.image) {
    articleNode.image = `${DOMAIN}${article.image}`;
  }

  if (article.page_type === "spoke" && up) {
    articleNode.isPartOf = { "@type": "WebPage", "@id": `${DOMAIN}${up.url}` };
  }

  const graph: object[] = [
    { "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
    articleNode,
  ];

  if (article.faq && article.faq.length >= 2) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
