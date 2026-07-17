# Защита сервера

Дата настройки: 17 июля 2026.
Сервер: `185.113.132.85` (chislavlasti.com), Ubuntu 24.

## 1. SSH-доступ

Root-логин по SSH отключён. Доступ — только пользователь `deploy`, только
по ключу.

- Создан пользователь `deploy`, добавлен в группу `sudo`
- `/etc/ssh/sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no`
- Владение репозиторием (`/var/www/numerology-site`) передано `deploy`
- PM2-процесс `site` и модуль `pm2-logrotate` перезапущены от `deploy`,
  автозапуск при перезагрузке — через systemd-юнит `pm2-deploy.service`
- Cron-задачи (публикация статей, еженедельный бэкап) перенесены из
  root-crontab в crontab `deploy`. Владение `/var/log/autopilot.log` и
  `/backup/` передано `deploy`. Root-crontab пуст
- `deploy` имеет NOPASSWD sudo только на `pm2 restart site`
  (`/etc/sudoers.d/deploy-pm2`), остальной sudo — с паролем
- GitHub Actions (CI) переключён на пользователя `deploy` (`VPS_USER`),
  доступ к репозиторию — через отдельный SSH deploy key (не приватный
  ключ пользователя)

Как настроить доступ с новой машины — см. `SSH_ACCESS.md`.

Root на сервере сейчас не используется вообще: ни для входа, ни для
cron, ни для PM2.

## 2. Firewall (ufw)

Активен. Default policy: `deny incoming`, `allow outgoing`.

Разрешены только:
- `22/tcp` — SSH
- `80/tcp` — HTTP
- `443/tcp` — HTTPS

Порт 3000 (Next.js, слушает локально за Nginx-прокси) снаружи недоступен.

## 3. fail2ban

Конфиг: `/etc/fail2ban/jail.local` (не трогает системный `jail.conf`).

Активные jail'ы:
- `sshd` — бан после 5 неудачных попыток за 10 минут, бан на 1 час
- `nginx-http-auth` — бан за подозрительные auth-попытки в Nginx
- `nginx-botsearch` — бан сканеров типовых уязвимых путей (`.env`,
  админки и т.п.), порог 10 попыток

Проверка статуса: `sudo fail2ban-client status <jail>`
Разбан вручную: `sudo fail2ban-client set <jail> unbanip <IP>`

## 4. Nginx rate limiting

Конфиг зон — `/etc/nginx/nginx.conf` (блок `http {}`):
```
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=revalidate:10m rate=1r/s;
```

Применение — `/etc/nginx/sites-available/chislavlasti.com`:
- `location /` — зона `general`, burst=20, nodelay
- `location /api/revalidate/` — отдельный блок, зона `revalidate`,
  burst=2, nodelay (единственный реальный API-эндпоинт сайта)

Превышение лимита → `503`.

## 5. SSL/TLS

`/etc/nginx/nginx.conf`, блок SSL Settings:
```
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

TLSv1 и TLSv1.1 отключены. Проверено: соединение по TLSv1.1 отклоняется.

Сертификат Let's Encrypt — без изменений, действителен до 2026-10-14
(см. `DEPLOYMENT.md`).

## 6. Автообновления безопасности

`unattended-upgrades` + `apt-listchanges`.

- `/etc/apt/apt.conf.d/50unattended-upgrades` — источники ограничены
  security-каналами (`${distro_codename}-security`, ESM Apps/Infra
  security). Обычные `noble-updates` исключены — обновляются вручную
- `Unattended-Upgrade::Automatic-Reboot "false"` — автоперезагрузка
  отключена. Если апдейт потребует рестарта, появится файл
  `/var/run/reboot-required` — перезагрузка вручную, по решению
- `Unattended-Upgrade::Mail "root"`, `MailOnlyOnError "true"` —
  уведомление только при ошибках
- `/etc/apt/apt.conf.d/20auto-upgrades` — проверка раз в сутки

Проверка вручную: `sudo unattended-upgrade --dry-run --debug`

## Не сделано / на заметку

- Резервный доступ на случай потери SSH-ключа не проверен явно —
  предполагается web-консоль в панели провайдера VPS
- Ротация архивов `/backup/` не настроена (см. `DEPLOYMENT.md`,
  раздел «Бэкап») — не связано напрямую с сегодняшней темой, но по
  той же папке