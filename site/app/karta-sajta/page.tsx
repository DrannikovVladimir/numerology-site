import type { Metadata } from "next";
import Link from "next/link";
import path from "path";
import { promises as fs } from "fs";

export const metadata: Metadata = {
  title: "Карта сайта | Нумерология",
  description:
    "Полная карта сайта chislavlasti.com — все опубликованные разделы и статьи о нумерологии.",
  robots: {
    index: true,
    follow: true,
  },
};

// Обновляется раз в час, как sitemap.xml — без пересборки кода
export const revalidate = 3600;

type Cluster = {
  id: number;
  page_id: string;
  title: string;
  page_type: "hub" | "spoke" | "standalone";
  hub_id: string;
  url: string;
};

type ClustersFile = {
  meta: { total: number };
  clusters: Cluster[];
};

type PlannedUrls = Record<string, boolean>;

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function getSiteTree() {
  // site/content/planned-urls.json — реестр published/не published
  const plannedUrlsPath = path.join(
    process.cwd(),
    "content",
    "planned-urls.json"
  );
  // content/semantic_clusters.json — реестр всех кластеров, лежит в
  // корне репозитория, на уровень выше директории site/
  const clustersPath = path.join(
    process.cwd(),
    "..",
    "content",
    "semantic_clusters.json"
  );

  const [plannedUrls, clustersFile] = await Promise.all([
    readJson<PlannedUrls>(plannedUrlsPath),
    readJson<ClustersFile>(clustersPath),
  ]);

  const isPublished = (url: string) => plannedUrls[url] === true;

  const clusters = clustersFile.clusters;

  const hubs = clusters
    .filter((c) => c.page_type === "hub")
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));

  const standalone = clusters
    .filter((c) => c.page_type === "standalone" && isPublished(c.url))
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));

  const tree = hubs.map((hub) => {
    const children = clusters
      .filter((c) => c.page_type === "spoke" && c.hub_id === hub.page_id)
      .filter((c) => isPublished(c.url))
      .sort((a, b) => a.title.localeCompare(b.title, "ru"));

    return {
      hub,
      hubPublished: isPublished(hub.url),
      children,
    };
  });

  return { tree, standalone };
}

export default async function SitemapPage() {
  const { tree, standalone } = await getSiteTree();

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
          Карта сайта
        </h1>
        <p className="text-inkMuted text-sm mb-10">
          Все опубликованные разделы и статьи
        </p>

        <div className="space-y-8">
          {tree.map(({ hub, hubPublished, children }) => {
            // Раздел без единой опубликованной страницы (ни хаба, ни
            // дочерних) — не показываем в дереве вовсе
            if (!hubPublished && children.length === 0) return null;

            return (
              <section key={hub.id}>
                {hubPublished ? (
                  <Link
                    href={hub.url}
                    className="text-lg font-semibold text-ink hover:text-terracotta"
                  >
                    {hub.title}
                  </Link>
                ) : (
                  <span className="text-lg font-semibold text-inkMuted">
                    {hub.title}
                  </span>
                )}

                {children.length > 0 && (
                  <ul className="mt-2 ml-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.url}
                          className="text-sm text-inkMuted hover:text-terracotta"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          {standalone.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-ink mb-2">
                Отдельные страницы
              </h2>
              <ul className="ml-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {standalone.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={page.url}
                      className="text-sm text-inkMuted hover:text-terracotta"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}