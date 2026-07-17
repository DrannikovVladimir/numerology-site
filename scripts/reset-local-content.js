// scripts/reset-local-content.js
//
// Локальная утилита: переносит все статьи из content/published/ обратно
// в content/pending/ и удаляет поля date_published/date_modified, чтобы
// вернуть файлы в исходное "чистое" состояние (как до публикации).
//
// Сервера не касается — работает только с локальными файлами.
//
// Запуск из корня репозитория:
//   node scripts/reset-local-content.js

const fs = require('fs');
const path = require('path');

const PUBLISHED_DIR = path.join('content', 'published');
const PENDING_DIR = path.join('content', 'pending');

if (!fs.existsSync(PUBLISHED_DIR)) {
  console.log('content/published/ не найдена — нечего откатывать.');
  process.exit(0);
}

if (!fs.existsSync(PENDING_DIR)) {
  fs.mkdirSync(PENDING_DIR, { recursive: true });
}

const files = fs.readdirSync(PUBLISHED_DIR).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  console.log('content/published/ пустая — нечего откатывать.');
  process.exit(0);
}

let moved = 0;

for (const file of files) {
  const srcPath = path.join(PUBLISHED_DIR, file);
  const destPath = path.join(PENDING_DIR, file);

  const article = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  delete article.date_published;
  delete article.date_modified;

  fs.writeFileSync(destPath, JSON.stringify(article, null, 2) + '\n', 'utf-8');
  fs.unlinkSync(srcPath);

  moved += 1;
  console.log(`Перенесено: ${file}`);
}

console.log(`\nГотово. Перенесено файлов: ${moved}.`);
console.log(`content/pending/: ${fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith('.json')).length}`);
console.log(`content/published/: ${fs.readdirSync(PUBLISHED_DIR).filter((f) => f.endsWith('.json')).length}`);
