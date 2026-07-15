# Деплой на VPS

Деплой ещё не выполнялся — это инструкция на будущее. Шаги ниже отражают
текущий набор реализованных скриптов (`publish.js`, `linkbuilder.js`,
`update-planned-urls.js`, `build-anchors.js`); `generate.js` и
`telegram.js` не существуют, поэтому в cron их нет.

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

## Структура на VPS

```
/var/www/
  /site/          ← Next.js сайт
  /autopilot/     ← publish.js, linkbuilder.js, build-anchors.js, update-planned-urls.js
  /content/       ← статьи и изображения
    /pending/
    /published/
    /error/
    /images/
```

## Деплой сайта

```bash
# Клонировать репозиторий
git clone https://github.com/... /var/www/site

# Установить зависимости
cd /var/www/site
npm install

# Собрать
npm run build

# Запустить через PM2
pm2 start npm --name "site" -- start
pm2 save
pm2 startup
```

Перед первым `npm run build` убедиться, что `next.config.mjs` содержит
`trailingSlash: true` — без этой настройки прод-сборка отдаёт `308
Permanent Redirect` на каждой статье (все внутренние ссылки сайта
построены со слэшем на конце). Настройка уже должна быть в репозитории;
если её нет — добавить до сборки.

## Деплой автопилота

```bash
# Клонировать
git clone https://github.com/... /var/www/autopilot

# Установить зависимости
cd /var/www/autopilot
npm install

# Настроить cron
crontab -e
# Добавить строку:
0 10 * * * cd /var/www/autopilot && node publish.js && node linkbuilder.js --dir /var/www/content/published/ >> /var/log/autopilot.log 2>&1
```

Одна строка делает оба шага подряд: сначала публикует статью(-и) из
очереди, затем прогоняет линкбилдер по всей папке `published/`.
`linkbuilder.js --dir` безопасно перезапускать на уже слинкованных
статьях — он пропускает зоны, где ссылка уже стоит, и трогает только
новые/пустые зоны. Уведомлений в Telegram в конце нет — не реализовано.

Sitemap не обновляется публикацией — это статический роут, собирается
только при `npm run build`. Если важно, чтобы `sitemap.xml` отражал
свежие публикации, нужна периодическая пересборка сайта отдельным
cron-заданием, например раз в сутки:
```bash
30 10 * * * cd /var/www/site && npm run build && pm2 restart site >> /var/log/site-rebuild.log 2>&1
```
(запускать после `publish.js`, не одновременно с ним).

## Настройка Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # Статика Next.js — кэш на год
    location /_next/static/ {
        alias /var/www/site/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Изображения — кэш на месяц
    location /images/ {
        alias /var/www/content/images/;
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
# Применить конфиг
sudo nginx -t
sudo systemctl reload nginx
```

## SSL (после подключения домена)

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot автоматически обновляет сертификат каждые 90 дней.

## Обновление сайта

```bash
cd /var/www/site
git pull
npm install
npm run build
pm2 restart site
```

## Обновление автопилота

```bash
cd /var/www/autopilot
git pull
npm install
# cron подхватывает изменения автоматически
```

## Мониторинг

```bash
# Статус сайта
pm2 status
pm2 logs site

# Логи публикатора и линкбилдера
tail -f /var/log/autopilot.log

# Логи пересборки (если настроена)
tail -f /var/log/site-rebuild.log

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Бэкап

```bash
# Бэкап контента (раз в неделю через cron)
0 3 * * 0 tar -czf /backup/content-$(date +%Y%m%d).tar.gz /var/www/content/
```