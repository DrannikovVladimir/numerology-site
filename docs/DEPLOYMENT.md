# Деплой на VPS

Деплой ещё не выполнялся — это инструкция на будущее. Отражает решение:
git синхронизирует только код, контент доставляется отдельно через rsync
(см. `docs/ARCHITECTURE.md`, раздел «Три независимых канала
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

## Первоначальный запуск (один раз)

```bash
# 1. Клонировать репозиторий (.gitignore уже настроен, контент туда не попадёт)
git clone https://github.com/твой-репозиторий /var/www/numerology-site
cd /var/www/numerology-site

# 2. Создать папки под контент (их нет в git)
mkdir -p content/pending content/published content/error

# 3. Создать .env с секретом для сброса кеша (НЕ в git, только на сервере)
cd site
echo "REVALIDATE_SECRET=$(openssl rand -hex 32)" > .env
cat .env   # сохрани это значение — понадобится в scripts/update-article.sh

# 4. Собрать и поднять сайт
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
VPS_HOST=user@1.2.3.4 bash scripts/sync-content.sh
```
Требует, чтобы SSH-доступ к серверу был настроен по ключу (без пароля).
Скрипт использует `rsync --ignore-existing` — безопасен для повторных
запусков, не тронет файлы, уже обработанные на сервере.

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

## Обновление уже опубликованной статьи

Если статью нужно доработать (добавить картинки, раздел и т.п.) уже
после публикации:
```bash
# 1. Скачать текущую версию с сервера
rsync -avz user@1.2.3.4:/var/www/numerology-site/content/published/chislo-sudby-7.json content/published/

# 2. Отредактировать локально content/published/chislo-sudby-7.json

# 3. Отправить обновление и сбросить кеш этой страницы
REVALIDATE_SECRET=<значение из site/.env на сервере> VPS_HOST=user@1.2.3.4 \
  bash scripts/update-article.sh content/published/chislo-sudby-7.json /chislo-sudby/7/
```
`update-article.sh` сам проставит `date_modified`, перезапишет файл на
сервере (не через `pending/`) и вызовет `/api/revalidate` — изменения
появятся на сайте сразу, без ожидания суточного окна кеша и без
пересборки. Подробности механизма — `docs/ARCHITECTURE.md`.

## Кеширование (ISR) — почему пересборка сайта не нужна для контента

Сайт использует on-demand ISR:
- `/[...slug]/page.tsx` — `revalidate = 86400` (сутки). Новая статья
  открывается сразу же по первому запросу, без пересборки и рестарта PM2
- `sitemap.xml` — `revalidate = 3600` (час). Новая публикация появляется
  в sitemap автоматически в течение часа, тоже без пересборки
- Правка уже опубликованной статьи — мгновенно, через
  `scripts/update-article.sh` и `/api/revalidate` (см. выше)

`npm run build` нужен **только** при изменении кода сайта — компонентов,
стилей, конфигурации. Публикация и правка контента его не требуют.

## CI/CD — деплой кода по git push

Три секрета в GitHub → Settings → Secrets: `VPS_HOST`, `VPS_USER`,
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
- Новая пачка статей → **не через git**, а через `scripts/sync-content.sh`
- Правка существующей статьи → **не через git**, а через
  `scripts/update-article.sh`

CI/CD **не должен** вызывать `publish.js` — публикация только по cron
на сервере, раз в сутки, независимо от того, когда и сколько раз был
сделан push кода.

## Настройка Nginx

```nginx
server {
    listen 80;
    server_name chislavlasti.com www.chislavlasti.com;

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

## Блокировка индексации на время тестирования

Пока сайт в тестовом режиме (первый деплой, проверка публикации,
ещё нет реального контента для пользователей), поисковики **не должны**
его индексировать — иначе в Google/Яндекс попадут тестовые/пустые
страницы, от которых потом сложно избавиться.

Добавлено в блок `location /` конфига Nginx
(`/etc/nginx/sites-available/chislavlasti.com`):

```nginx
location / {
    add_header X-Robots-Tag "noindex, nofollow";
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Заголовок `X-Robots-Tag: noindex, nofollow` действует так же, как
`<meta name="robots" content="noindex, nofollow">`, но накладывается на
уровне Nginx — не требует правки кода или пересборки Next.js, снимается
одной правкой конфига.

**Обязательно удалить эту строку перед реальным запуском в продакшн** —
иначе сайт никогда не попадёт в поисковую выдачу. После удаления:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Проверка текущего состояния (какая бы страница сайта ни проверялась):

```bash
curl -I http://chislavlasti.com | grep X-Robots-Tag
```

Если строка `X-Robots-Tag: noindex, nofollow` есть в ответе — индексация
заблокирована. Если её нет — сайт открыт для поисковых ботов.

Отдельно стоит проверить `site/app/robots.ts` (динамический
`/robots.txt`) перед реальным запуском — там не должно остаться
забытых `Disallow: /`, если такие вставлялись на время тестов через код,
а не только через Nginx-заголовок.

## SSL (после подключения домена)

```bash
sudo certbot --nginx -d chislavlasti.com -d www.chislavlasti.com
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