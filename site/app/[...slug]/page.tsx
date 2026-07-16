import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import BlockRenderer, { Block } from "@/components/blocks/BlockRenderer";
import TableOfContents from "@/components/TableOfContents";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildJsonLd } from "@/lib/jsonld";
import plannedUrls from "@/content/planned-urls.json";
export const revalidate = 86400;

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

interface Article {
  page_id: string;
  url?: string;
  page_type: string;
  meta: {
    title: string;
    description: string;
    h1: string;
  };
  image?: string;
  image_alt?: string;
  nav_title?: string;
  primary_keyword?: string;
  internal_links?: {
    up?: { url: string; anchor: string } | null;
  };
  faq?: { question: string; answer: string }[];
  date_published?: string;
  date_modified?: string;
  blocks: Block[];
}

// Читает статью из content/published по slug.
// Возвращает null, если файла не существует (страница ещё не опубликована).
async function getArticleBySlug(slug: string[]): Promise<Article | null> {
  const filename = slug.length > 1 ? slug.join("-") : slug[0];
  const filePath = path.join(process.cwd(), "..", "content/published", `${filename}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as Article;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

interface ArticlePageProps {
  params: {
    slug: string[];
  };
}

// Пустой массив — на этапе сборки конкретные slug'и неизвестны.
// dynamicParams остаётся true по умолчанию: Next.js рендерит и кеширует
// каждую новую страницу при первом запросе (on-demand ISR).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    const url = "/" + params.slug.join("/") + "/";

    if (url in plannedUrls) {
      return {
        title: "Страница в разработке",
        robots: { index: false, follow: false },
      };
    }

    return {
      title: "Страница не найдена",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: article.meta.title,
    description: article.meta.description,
    keywords: article.primary_keyword,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://chislavlasti.com${article.url}`,
    },
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      url: `https://chislavlasti.com${article.url}`,
      siteName: "Нумерология",
      images: article.image
        ? [{ url: `https://chislavlasti.com${article.image}`, width: 1200, height: 630, alt: article.image_alt ?? "" }]
        : [],
      locale: "ru_RU",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description: article.meta.description,
      images: article.image ? [`https://chislavlasti.com${article.image}`] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    const url = "/" + params.slug.join("/") + "/";

    if (url in plannedUrls) {
      return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 bg-parchment px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-ink">Страница в разработке</h1>
          <p className="text-lg text-inkMuted">
            Эта страница скоро появится — мы уже работаем над ней
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

    notFound();
  }

  const pageType = (
    article.page_type === "hub" || article.page_type === "spoke" || article.page_type === "standalone"
      ? article.page_type
      : "standalone"
  ) as "hub" | "spoke" | "standalone";

  const parentLink = article.internal_links?.up ?? undefined;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(article)) }}
      />
      <Breadcrumbs
        pageType={pageType}
        currentTitle={article.nav_title ?? article.meta.h1}
        parentLink={parentLink}
      />
      <h1 className="text-3xl font-bold text-ink">{article.meta.h1}</h1>
      {article.image && (
        <figure className="my-6">
          <NextImage
            src={article.image}
            alt={article.image_alt ?? ""}
            width={1200}
            height={630}
            className="rounded-md w-full h-auto"
          />
        </figure>
      )}
      <TableOfContents blocks={article.blocks} />
      <BlockRenderer blocks={article.blocks} />
    </main>
  );
}
