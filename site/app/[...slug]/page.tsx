import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer, { Block } from "@/components/blocks/BlockRenderer";

interface Article {
  page_id: string;
  meta: {
    title: string;
    description: string;
    h1: string;
  };
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

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: article.meta.title,
    description: article.meta.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{article.meta.h1}</h1>
      <BlockRenderer blocks={article.blocks} />
    </main>
  );
}
