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
  читает JSON из `content/published/` в момент запроса (динамический роут,
  без пререндера при сборке)
- **Публикатор** (`autopilot/publish.js`) — перекладывает статьи из
  `pending/` в `published/`
- **Линкбилдер** (`autopilot/linkbuilder.js`) — автоматическая простановка
  внутренних ссылок
- **Хранилище** — JSON-файлы на диске, каждый скрипт читает/пишет их
  напрямую через `fs`, без общего интерфейса

## Технологии
```
Сайт:         Next.js 14 (App Router), Tailwind CSS, TypeScript
Автопилот:    Node.js (publish.js, linkbuilder.js, build-anchors.js,
              update-planned-urls.js)
Сервер:       Ubuntu 24, Nginx, PM2 (деплой ещё не выполнен)
```

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
- [CONTENT.md](CONTENT.md) — контентный пайплайн