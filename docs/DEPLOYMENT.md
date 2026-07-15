# Деплой на VPS

Деплой ещё не выполнялся — это инструкция на будущее. Отражает решение:
git синхронизирует только код, контент доставляется отдельно через rsync
(см. `docs/ARCHITECTURE.md`, раздел «Два независимых канала
синхронизации»).

## Требования к серверу

```
OS:       Ubuntu 24
RAM:      2 GB минимум
CPU:      2 ядра минимум
Диск:     20 GB минимум
Node.js:  20+
```

## Установка окружения

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot (SSL — после подключения домена)
sudo apt install -y certbot python3-certbot-nginx
```

## Подготовка репозитория — .gitignore

**До первого коммита с деплоем** добавить в `.gitignore` в корне репозитория:
```
content/pending/
content/published/
content/error/
content/images/
content/anchors.json
site/content/planned-urls.json
```
`content/semantic_clusters.json` **остаётся отслеживаемым** — редактируется
только вручную, скрипты его не пишут.

Если какие-то из этих путей уже закоммичены (например, из тестового
прогона) — убрать их из индекса до пуша, не удаляя с диска:
```bash
git rm -r --cached content/pending content/published content/anchors.json site/content/planned-urls.json
git add .gitignore
git commit -m "content: файлы публикации не отслеживаются git, доставка через rsync"
```

## Первоначальный запуск (один раз)

```bash
# 1. Клонировать репозиторий
git clone https://github.com/твой-репозиторий /var/www/numerology-site
cd /var/www/numerology-site

# 2. Создать папки под контент (их нет в git)
mkdir -p content/pending content/published content/error

# 3. Собрать и поднять сайт
cd site
npm install
npm run build
pm2 start npm --name "site" -- start
pm2 save
pm2 startup
```

Перед `npm run build` убедиться, что `next.config.mjs` содержит
`trailingSlash: true` — без этой настройки прод-сборка отдаёт `308
Permanent Redirect` на каждой статье.

## Доставка первых статей на сервер

Локально, из корня репозитория:
```bash
bash scripts/sync-content.sh
```
Содержимое `scripts/sync-content.sh`:
```bash
#!/bin/bash
# Доставляет новые статьи из локальной content/pending/ на сервер.
# Не трогает файлы, которых уже нет локально (значит уже опубликованы
# на сервере) — используется --ignore-existing, а не полная синхронизация.
set -e

VPS_HOST="user@your-vps-ip"
VPS_PATH="/var/www/numerology-site/content/pending/"

rsync -avz --ignore-existing content/pending/ "$VPS_HOST:$VPS_PATH"
echo "Готово. Статьи скопированы в очередь на сервере."
```
Требует, чтобы SSH-доступ к серверу был настроен по ключу (без пароля).

## Публикация первых 30 статей (один раз, вручную)

```bash
ssh user@your-vps-ip
cd /var/www/numerology-site
node autopilot/publish.js --count 30
node autopilot/linkbuilder.js --dir content/published/
```

## Автопубликация — cron на сервере

```bash
crontab -e
# Добавить строку:
0 10 * * * cd /var/www/numerology-site/autopilot && node publish.js --count 1 && node linkbuilder.js --dir ../content/published/ >> /var/log/autopilot.log 2>&1
```
Одна строка делает оба шага подряд: публикует статью(-и) из очереди,
затем прогоняет линкбилдер по всей папке `published/`.
`linkbuilder.js --dir` безопасно перезапускать на уже слинкованных
статьях — он пропускает зоны, где ссылка уже стоит.

Дальше единственное, что нужно делать вручную — генерировать новые
статьи локально и раз в какое-то время запускать `sync-content.sh`,
чтобы доставить их в очередь на сервере. Публикация из очереди
происходит сама, по одной в день.

## Кеширование (ISR) — почему пересборка сайта не нужна для контента

Сайт использует on-demand ISR:
- `/[...slug]/page.tsx` — `revalidate = 86400` (сутки). Новая статья
  открывается сразу же по первому запросу, без пересборки и рестарта PM2
- `sitemap.xml` — `revalidate = 3600` (час). Новая публикация появляется
  в sitemap автоматически в течение часа, тоже без пересборки

`npm run build` нужен **только** при изменении кода сайта — компонентов,
стилей, конфигурации. Публикация контента его не требует.

## CI/CD — деплой кода по git push

Два секрета в GitHub → Settings → Secrets: `VPS_HOST`, `VPS_USER`,
`DEPLOY_SSH_KEY` (приватный ключ; публичный — в `~/.ssh/authorized_keys`
на сервере).

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      site-changed: ${{ steps.filter.outputs.site }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            site:
              - 'site/**'
              - 'autopilot/**'

  deploy:
    needs: detect-changes
    runs-on: ubuntu-latest
    steps:
      - name: git pull на сервере
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /var/www/numerology-site
            git pull origin main

      - name: Пересборка — только если менялся код
        if: needs.detect-changes.outputs.site-changed == 'true'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /var/www/numerology-site/site
            npm install
            npm run build
            pm2 restart site
```

**Что это даёт:**
- Правка компонента/стиля/конфига → `git push` → сайт пересобран и
  перезапущен автоматически
- Новая пачка статей → **не через git**, а через `scripts/sync-content.sh` →
  файлы попадают в очередь на сервере → cron публикует по расписанию

CI/CD **не должен** вызывать `publish.js` — публикация только по cron
на сервере, раз в сутки, независимо от того, когда и сколько раз был
сделан push кода.

## Настройка Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # Статика Next.js — кэш на год
    location /_next/static/ {
        alias /var/www/numerology-site/site/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Изображения — кэш на месяц
    location /images/ {
        alias /var/www/numerology-site/content/images/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Всё остальное — Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## SSL (после подключения домена)

```bash
sudo certbot --nginx -d example.com -d www.example.com
```
Certbot автоматически обновляет сертификат каждые 90 дней.

## Мониторинг

```bash
# Статус сайта
pm2 status
pm2 logs site

# Логи публикатора и линкбилдера
tail -f /var/log/autopilot.log

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Бэкап

```bash
# Бэкап контента (раз в неделю через cron на сервере)
0 3 * * 0 tar -czf /backup/content-$(date +%Y%m%d).tar.gz /var/www/numerology-site/content/
```
Контент не в git — это единственная копия данных, кроме локальной машины;
бэкап на сервере обязателен, не опционален.