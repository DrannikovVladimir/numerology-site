import type { MetadataRoute } from "next";
import plannedUrls from "@/content/planned-urls.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const published = (Object.entries(plannedUrls) as [string, boolean][])
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
