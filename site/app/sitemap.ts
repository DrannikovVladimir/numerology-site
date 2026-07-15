import fs from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const filePath = path.join(process.cwd(), "content/planned-urls.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const plannedUrls = JSON.parse(raw) as Record<string, boolean>;

  const published = Object.entries(plannedUrls)
    .filter(([, published]) => published)
    .map(([url]) => ({
      url: `https://example.com${url}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: url.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6,
    }));

  return [
    {
      url: "https://example.com/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...published,
  ];
}