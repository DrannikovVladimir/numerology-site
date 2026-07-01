const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CLUSTERS_PATH = path.join(ROOT, "content/semantic_clusters.json");
const PUBLISHED_DIR = path.join(ROOT, "content/published");
const OUTPUT_PATH = path.join(ROOT, "site/content/planned-urls.json");

// Повторяет логику getArticleBySlug: сегменты URL → имя файла через дефис
function urlToFilename(url) {
  const segments = url.split("/").filter(Boolean);
  return segments.join("-") + ".json";
}

const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, "utf-8"));
const publishedFiles = new Set(fs.readdirSync(PUBLISHED_DIR));

const result = {};
let publishedCount = 0;

for (const cluster of clusters.clusters) {
  const url = cluster.url;
  const filename = urlToFilename(url);
  const isPublished = publishedFiles.has(filename);
  result[url] = isPublished;
  if (isPublished) publishedCount++;
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf-8");

const total = clusters.clusters.length;
console.log(`Всего URL: ${total}`);
console.log(`Опубликовано: ${publishedCount}`);
console.log(`Не опубликовано: ${total - publishedCount}`);
console.log(`Записано: ${OUTPUT_PATH}`);
