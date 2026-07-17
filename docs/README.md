# Нумерологический сайт

## Что это
Информационный сайт по нумерологии на русском языке.
Контент — JSON-статьи, отдаются сайтом динамически через Next.js.
Цель — органический трафик из Google и Яндекс с переводом в Telegram-канал и бот.

## Как работает сейчас
1. Семантическое ядро кластеризуется вручную (один раз) — `content/semantic_clusters.json`
2. Статьи генерируются вручную, в чате с Claude, по промптам и skill-файлам
   из `autopilot/prompts/` (см. `docs/AUTOPILOT.md`, `docs/CONTENT.md`).
   Готовый JSON сохраняется вручную в `content/pending/`
3. `autopilot/publish.js` публикует статьи из очереди: переносит в
   `content/published/`, проставляет `date_published`/`date_modified`,
   обновляет `site/content/planned-urls.json`
4. `autopilot/linkbuilder.js` — отдельный шаг, простановка контекстных
   ссылок. Не вызывается автоматически из `publish.js`
5. Hub-страницы пишутся тем же ручным способом, что и spoke

## Компоненты
- **Сайт** — Next.js 14, отдаёт статьи пользователям; роут `/[...slug]/`
  читает JSON из `content/published/` при первом запросе и кеширует
  результат на сутки (on-demand ISR, см. `docs/ARCHITECTURE.md`)
- **Публикатор** (`autopilot/publish.js`) — перекладывает статьи из
  `pending/` в `published/`
- **Линкбилдер** (`autopilot/linkbuilder.js`) — автоматическая простановка
  внутренних ссылок
- **Валидатор реестра** (`autopilot/validate-clusters.js`) — проверка
  `semantic_clusters.json` перед коммитом
- **Хранилище** — JSON-файлы на диске, каждый скрипт читает/пишет их
  напрямую через `fs`, без общего интерфейса; контент не в git,
  доставляется через `rsync` (`scripts/sync-content.sh`,
  `scripts/update-article.sh`)

## Технологии
```
Сайт:         Next.js 14 (App Router), Tailwind CSS, TypeScript
Автопилот:    Node.js (publish.js, linkbuilder.js, build-anchors.js,
              update-planned-urls.js, validate-clusters.js)
Синхронизация: rsync (sync-content.sh, update-article.sh), git — только код
Сервер:       Ubuntu 24, Nginx, PM2, SSL (Let's Encrypt)
```

Актуальный статус деплоя (домен, сервер, CI/CD и т.п.) — единственный
источник истины `docs/CLAUDE.md`, раздел «Готово».

## Не реализовано
Генерация статей скриптом (`generate.js`), автоматическая валидация
(`validator.js`), Telegram-уведомления (`telegram.js`) и слой хранилища
(`storage.js`) — не написаны. Подробности и статус каждого пункта —
`docs/CLAUDE.md`, раздел «Не сделано».

## Структура репозитория
```
/site/          ← Next.js сайт
/autopilot/     ← скрипты публикации и линковки, промпты генерации
/content/       ← статьи и изображения
/docs/          ← документация
```

## Документация
- [ARCHITECTURE.md](ARCHITECTURE.md) — архитектура системы
- [SITE.md](SITE.md) — структура сайта и страниц
- [AUTOPILOT.md](AUTOPILOT.md) — логика публикации и линковки
- [STORAGE.md](STORAGE.md) — как и где хранятся данные
- [API.md](API.md) — внешние сервисы (Anthropic, Telegram)
- [DEPLOYMENT.md](DEPLOYMENT.md) — деплой на VPS
- [SECURITY.md](SECURITY.md) — защита сервера (firewall, fail2ban,
  SSL, автообновления, SSH-доступ)
- [SSH_ACCESS.md](SSH_ACCESS.md) — настройка SSH-доступа к серверу с
  новой машины
- [CONTENT.md](CONTENT.md) — контентный пайплайн
- [CLAUDE.md](CLAUDE.md) — актуальный статус проекта (единственный
  источник истины по тому, что готово и что нет)