#!/usr/bin/env node
/**
 * publish.js — ручной публикатор статей
 *
 * Берёт файлы из content/pending/ (FIFO — по дате изменения файла,
 * старые первыми), проставляет date_published/date_modified,
 * перекладывает в content/published/, затем пересобирает
 * site/content/planned-urls.json.
 *
 * Использование:
 *   node autopilot/publish.js                # опубликовать 1 статью
 *   node autopilot/publish.js --count 10      # опубликовать 10 статей разом
 *   node autopilot/publish.js --dry-run       # только показать, что будет сделано
 *
 * Уведомления в Telegram здесь намеренно не реализованы —
 * telegram.js в проекте пока нет (см. CLAUDE.md).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PENDING_DIR = path.join(ROOT, "content/pending");
const PUBLISHED_DIR = path.join(ROOT, "content/published");
const UPDATE_SCRIPT = path.join(ROOT, "autopilot/update-planned-urls.js");

// --- аргументы командной строки ---
const args = process.argv.slice(2);
const countIndex = args.indexOf("--count");
const count = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 1;
const dryRun = args.includes("--dry-run");

if (isNaN(count) || count < 1) {
  console.error("Ошибка: --count должен быть положительным числом");
  process.exit(1);
}

// --- сегодняшняя дата в формате YYYY-MM-DD ---
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// --- получить список файлов pending, отсортированных по mtime (старые первыми) ---
function getPendingFilesFIFO() {
  const files = fs
    .readdirSync(PENDING_DIR)
    .filter((f) => f.endsWith(".json"));

  const withStats = files.map((f) => {
    const fullPath = path.join(PENDING_DIR, f);
    const stat = fs.statSync(fullPath);
    return { file: f, mtime: stat.mtimeMs };
  });

  withStats.sort((a, b) => a.mtime - b.mtime);
  return withStats.map((x) => x.file);
}

function main() {
  if (!fs.existsSync(PENDING_DIR)) {
    console.error(`Ошибка: не найдена папка ${PENDING_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(PUBLISHED_DIR)) {
    fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
  }

  const pendingFiles = getPendingFilesFIFO();

  if (pendingFiles.length === 0) {
    console.log("⚠️  content/pending/ пуст. Публиковать нечего.");
    process.exit(0);
  }

  const toPublish = pendingFiles.slice(0, count);
  const date = todayISO();

  console.log(`Найдено в очереди: ${pendingFiles.length}`);
  console.log(`Будет опубликовано: ${toPublish.length}`);
  console.log(`Дата публикации: ${date}`);
  if (dryRun) console.log("(dry-run — файлы не будут изменены)\n");
  console.log("");

  let published = 0;
  let errors = 0;

  for (const filename of toPublish) {
    const srcPath = path.join(PENDING_DIR, filename);
    const destPath = path.join(PUBLISHED_DIR, filename);

    try {
      const raw = fs.readFileSync(srcPath, "utf-8");
      const article = JSON.parse(raw);

      // Проставляем дату публикации, только если её ещё нет.
      // date_modified обновляем всегда (на случай будущих правок статьи).
      if (!article.date_published) {
        article.date_published = date;
      }
      article.date_modified = date;

      if (!dryRun) {
        fs.writeFileSync(destPath, JSON.stringify(article, null, 2) + "\n", "utf-8");
        fs.unlinkSync(srcPath);
      }

      console.log(`✓ ${filename}  →  ${article.url || "(url не указан)"}`);
      published++;
    } catch (err) {
      console.error(`✗ ${filename}  —  ОШИБКА: ${err.message}`);
      errors++;
    }
  }

  console.log("");
  console.log(`Опубликовано: ${published}`);
  if (errors > 0) console.log(`Ошибок: ${errors}`);
  console.log(`Осталось в очереди: ${pendingFiles.length - published}`);

  if (!dryRun && published > 0) {
    console.log("\nОбновляю site/content/planned-urls.json...");
    try {
      execSync(`node "${UPDATE_SCRIPT}"`, { stdio: "inherit" });
    } catch (err) {
      console.error("Не удалось обновить planned-urls.json:", err.message);
    }
  }
}

main();
