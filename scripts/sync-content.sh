#!/bin/bash
# scripts/sync-content.sh
#
# Доставляет новые статьи из локальной content/pending/ на сервер,
# минуя git (контент намеренно не отслеживается git — см. .gitignore
# и docs/ARCHITECTURE.md, раздел «Два независимых канала синхронизации»).
#
# --ignore-existing — не трогает файлы, которых уже нет локально
# (значит они уже были опубликованы и удалены из pending/ на сервере
# скриптом publish.js) и не перезаписывает то, что уже есть на сервере.
#
# Использование:
#   bash scripts/sync-content.sh
#
# Перед первым запуском заполнить VPS_HOST и VPS_PATH ниже, либо
# передать их через переменные окружения:
#   VPS_HOST=user@1.2.3.4 VPS_PATH=/var/www/numerology-site/content/pending/ bash scripts/sync-content.sh

set -e

VPS_HOST="${VPS_HOST:-user@your-vps-ip}"
VPS_PATH="${VPS_PATH:-/var/www/numerology-site/content/pending/}"
LOCAL_PATH="content/pending/"

if [ "$VPS_HOST" = "user@your-vps-ip" ]; then
  echo "Ошибка: заполни VPS_HOST в scripts/sync-content.sh или передай его"
  echo "через переменную окружения, например:"
  echo "  VPS_HOST=user@1.2.3.4 bash scripts/sync-content.sh"
  exit 1
fi

if [ ! -d "$LOCAL_PATH" ]; then
  echo "Ошибка: не найдена локальная папка $LOCAL_PATH"
  echo "Запускать из корня репозитория."
  exit 1
fi

COUNT=$(find "$LOCAL_PATH" -maxdepth 1 -name "*.json" | wc -l)

if [ "$COUNT" -eq 0 ]; then
  echo "В $LOCAL_PATH нет .json файлов — нечего отправлять."
  exit 0
fi

echo "Найдено локально: $COUNT файл(ов) в $LOCAL_PATH"
echo "Отправляю на $VPS_HOST:$VPS_PATH ..."

rsync -avz --ignore-existing "$LOCAL_PATH" "$VPS_HOST:$VPS_PATH"

echo ""
echo "Готово. Новые статьи скопированы в очередь на сервере."
echo "Публикация произойдёт по расписанию cron (см. docs/DEPLOYMENT.md)."