#!/bin/bash
# scripts/update-article.sh
#
# Доставляет обновлённый файл уже ОПУБЛИКОВАННОЙ статьи на сервер
# (перезаписывает, в отличие от sync-content.sh для новых статей) и
# сбрасывает ISR-кеш этого URL, чтобы изменения появились на сайте сразу,
# а не через revalidate-окно (см. docs/ARCHITECTURE.md, раздел про ISR).
#
# Использование:
#   bash scripts/update-article.sh content/published/chislo-sudby-7.json /chislo-sudby/7/
#
# Требует REVALIDATE_SECRET (тот же, что задан в .env на сервере)
# в переменной окружения локально:
#   REVALIDATE_SECRET=xxx bash scripts/update-article.sh <файл> <url>

set -e

LOCAL_FILE="$1"
ARTICLE_URL="$2"

VPS_HOST="${VPS_HOST:-user@your-vps-ip}"
VPS_CONTENT_PATH="${VPS_CONTENT_PATH:-/var/www/numerology-site/content/published/}"
SITE_URL="${SITE_URL:-https://example.com}"

if [ -z "$LOCAL_FILE" ] || [ -z "$ARTICLE_URL" ]; then
  echo "Использование: bash scripts/update-article.sh <путь-к-файлу.json> </url-статьи/>"
  echo "Пример: bash scripts/update-article.sh content/published/chislo-sudby-7.json /chislo-sudby/7/"
  exit 1
fi

if [ ! -f "$LOCAL_FILE" ]; then
  echo "Ошибка: файл $LOCAL_FILE не найден"
  exit 1
fi

if [ -z "$REVALIDATE_SECRET" ]; then
  echo "Ошибка: не задан REVALIDATE_SECRET"
  echo "  REVALIDATE_SECRET=xxx bash scripts/update-article.sh ..."
  exit 1
fi

# 1. Проставить date_modified = сегодня перед отправкой
node -e "
const fs = require('fs');
const path = '$LOCAL_FILE';
const article = JSON.parse(fs.readFileSync(path, 'utf-8'));
article.date_modified = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path, JSON.stringify(article, null, 2) + '\n', 'utf-8');
console.log('date_modified обновлён:', article.date_modified);
"

# 2. Перезаписать файл на сервере (без --ignore-existing — это обновление,
# а не доставка нового файла в очередь)
echo "Отправляю $LOCAL_FILE на сервер (перезапись)..."
rsync -avz "$LOCAL_FILE" "$VPS_HOST:$VPS_CONTENT_PATH"

# 3. Сбросить ISR-кеш этого URL
echo "Сбрасываю кеш для $ARTICLE_URL..."
curl -s -X POST "${SITE_URL}/api/revalidate?secret=${REVALIDATE_SECRET}&path=${ARTICLE_URL}"
echo ""
echo "Готово. Статья обновлена, кеш сброшен."