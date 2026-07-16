# Деплой на VPS

Домен: `chislavlasti.com`. IP сервера: `185.113.132.85`.
Git синхронизирует только код, контент доставляется отдельно через
rsync (см. `docs/ARCHITECTURE.md`, раздел «Три независимых канала
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

# Certbot
sudo apt install -y certbot python3-certbot-nginx
```

## Первоначальный запуск (один раз)

```bash
git clone https://github.com/твой-репозиторий /var/www/numerology-site
cd /var/www/numerology-site

mkdir -p content/pending content/published content/error

cd site
echo "REVALIDATE_SECRET=$(openssl rand -hex 32)" > .env
cat .env   # сохрани значение — понадобится в scripts/update-article.sh

npm install
npm run build
pm2 start npm --name "site" -- start
pm2 save
pm2 startup
```

Перед `npm run build` — `next.config.mjs` должен содержать
`trailingSlash: true`, иначе прод-сборка отдаёт `308 Permanent
Redirect` на каждой статье.

## Доставка статей на сервер

Локально, из корня репозитория:
```bash
VPS_HOST=root@185.113.132.85 bash scripts/sync-content.sh
```
`rsync --ignore-existing` — безопасен для повторных запусков, не
трогает файлы, уже обработанные на сервере.

## Публикация статей

Ручной запуск (разовый батч):
```bash
ssh root@185.113.132.85
cd /var/www/numerology-site/autopilot
node publish.js --count 30
node linkbuilder.js --dir ../content/published/
```

## Автопубликация — cron на сервере

```bash
crontab -e
```
```
0 */2 * * * cd /var/www/numerology-site/autopilot && node publish.js --count 1 && node linkbuilder.js --dir ../content/published/ >> /var/log/autopilot.log 2>&1
```
Публикует 1 статью из очереди каждые 2 часа (время сервера —
`Etc/UTC`), сразу прогоняет линкбилдер по `published/`.
`linkbuilder.js --dir` безопасно перезапускать повторно — пропускает
зоны, где ссылка уже стоит.

Проверить активные задачи: `crontab -l`.

## Обновление уже опубликованной статьи

```bash
# 1. Скачать текущую версию с сервера
rsync -avz root@185.113.132.85:/var/www/numerology-site/content/published/chislo-sudby-7.json content/published/

# 2. Отредактировать локально

# 3. Отправить обновление и сбросить кеш страницы
REVALIDATE_SECRET=<значение из site/.env на сервере> VPS_HOST=root@185.113.132.85 \
  bash scripts/update-article.sh content/published/chislo-sudby-7.json /chislo-sudby/7/
```
`update-article.sh` проставляет `date_modified`, перезаписывает файл
на сервере (не через `pending/`) и вызывает `/api/revalidate` —
изменения появляются на сайте сразу. Механизм — `docs/ARCHITECTURE.md`.

**Не тестировано на реальной правке** — проверить перед тем как
полагаться на скрипт в боевой работе.

## Кеширование (ISR)

- `/[...slug]/page.tsx` — `revalidate = 86400` (сутки)
- `sitemap.xml` — `revalidate = 3600` (час) — новая публикация
  появляется в sitemap с задержкой до часа, это штатное поведение
- Правка опубликованной статьи — мгновенно, через
  `scripts/update-article.sh` + `/api/revalidate`

`npm run build` нужен только при изменении кода сайта — публикация и
правка контента пересборки не требуют.

## CI/CD — деплой кода по git push

Три секрета в GitHub → Settings → Secrets: `VPS_HOST`
(`185.113.132.85`), `VPS_USER` (`root`), `DEPLOY_SSH_KEY` (отдельная
SSH-пара для CI, не та, которой заходят на сервер вручную; публичный
ключ — в `~/.ssh/authorized_keys` на сервере).

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

- Правка компонента/стиля/конфига → `git push` → пересборка и рестарт
  автоматически
- Новая пачка статей → `scripts/sync-content.sh`, не через git
- Правка существующей статьи → `scripts/update-article.sh`, не через git
- CI/CD не вызывает `publish.js` — публикация только по cron

## Настройка Nginx

`/etc/nginx/sites-available/chislavlasti.com`:

```nginx
server {
    listen 80;
    server_name chislavlasti.com www.chislavlasti.com;

    location /_next/static/ {
        alias /var/www/numerology-site/site/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /var/www/numerology-site/content/images/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        add_header X-Robots-Tag "noindex, nofollow";
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

После правки конфига:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

После запуска certbot (см. ниже) в файл автоматически добавляются
блоки для SSL — certbot сам модифицирует конфиг, вручную добавленные
строки (например, `X-Robots-Tag`) сохраняются.

## Блокировка индексации на время тестирования

`X-Robots-Tag: noindex, nofollow` в блоке `location /` (см. конфиг
выше) — действует так же, как `<meta name="robots"
content="noindex, nofollow">`, но на уровне Nginx, без пересборки
Next.js.

**Убрать перед реальным запуском в продакшн**, иначе сайт не попадёт
в поисковую выдачу:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

Проверка:
```bash
curl -I https://chislavlasti.com | grep X-Robots-Tag
```
Строка в ответе = индексация заблокирована.

Отдельно проверить `site/app/robots.ts` перед реальным запуском — не
должно быть забытых `Disallow: /`.

## SSL

```bash
sudo certbot --nginx -d chislavlasti.com -d www.chislavlasti.com
```
Выпускает сертификат для обоих доменов, настраивает редирект HTTP →
HTTPS (`301`), ставит автообновление в фоне.

Текущий сертификат действителен до **2026-10-14**.

Проверка:
```bash
curl -I https://chislavlasti.com   # HTTP/1.1 200 OK
curl -I http://chislavlasti.com    # 301 → https://chislavlasti.com/
```

## Логирование

| Источник | Файл(ы) | Ротация |
|---|---|---|
| Публикатор + линкбилдер (cron) | `/var/log/autopilot.log` | logrotate, см. ниже |
| PM2 (процесс `site`) | `~/.pm2/logs/site-*.log` | pm2-logrotate, см. ниже |
| Nginx | `/var/log/nginx/access.log`, `error.log` | системный logrotate (штатно, из коробки) |

**PM2:**
```bash
pm2 install pm2-logrotate
```
Дефолты: макс. размер файла 10MB, хранится 30 копий, проверка раз в
сутки. Проверить: `pm2 list` (должен появиться процесс
`pm2-logrotate`), настройки — `pm2 conf pm2-logrotate`.

**autopilot.log:**
```bash
sudo nano /etc/logrotate.d/autopilot
```
```
/var/log/autopilot.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```
Проверка конфига без применения: `sudo logrotate -d
/etc/logrotate.d/autopilot`.

**Важная ловушка:** `logrotate` откажется ротировать лог, если
родительская директория (`/var/log/`) считается «insecure» — world-
или group-writable для группы, отличной от `root`. На Ubuntu `/var/log/`
по умолчанию принадлежит `root:syslog` с правами `755` — это
корректно и безопасно (группа `syslog` нужна демону `rsyslog`, но
права `755` не дают группе писать). Если права почему-то оказались
шире (`775`/`777`), правильное исправление — вернуть `755`, **не
трогая владельца/группу**:
```bash
sudo chmod 755 /var/log/
```
Менять `chown` на `root:root` не нужно и рискованно — это может лишить
`rsyslog` прав на создание системных логов. Если группа всё же была
изменена по ошибке, вернуть:
```bash
sudo chown root:syslog /var/log/
```

## Мониторинг

```bash
pm2 status
pm2 logs site
tail -f /var/log/autopilot.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
crontab -l
```

## Бэкап

```bash
crontab -e
```
```
0 3 * * 0 mkdir -p /backup && tar -czf /backup/content-$(date +\%Y\%m\%d).tar.gz /var/www/numerology-site/content/
```
Архивирует `content/` каждое воскресенье в 03:00 (время сервера).
Внутри crontab символ `%` требует экранирования (`\%`), иначе
трактуется как перенос строки.

Контент не в git — бэкап на сервере является дополнительной защитой
поверх локальной копии на машине разработки.

**Не сделано:** ротация старых бэкапов — архивы в `/backup/` копятся
без автоудаления, стоит настроить при накоплении файлов.