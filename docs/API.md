# Внешние сервисы

## Claude (генерация контента)

### Текущее использование
Статьи генерируются вручную — в чате с Claude, промптами
`autopilot/prompts/prompt_02_onpage.md` и `prompt_03_generator.md` вместе
с нужными skill-файлами (`autopilot/prompts/skills/`). Готовый JSON
копируется/сохраняется вручную в `content/pending/`.

Программного вызова Anthropic API из скрипта в проекте нет —
`autopilot/generate.js` не реализован. Ниже — ориентировочная схема
вызова на случай, если такой скрипт появится в будущем; сейчас в проекте
не используется.

```javascript
// Целевой пример, не реализовано:
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 8000,
  system: systemPrompt,
  messages: [
    { role: 'user', content: userMessage }
  ]
})
```

## Telegram

### Bot и канал сайта
Ссылки на Telegram-бота и канал зашиты прямо в контент статей (кнопки CTA):
```
Бот:    https://t.me/numerolog_master_bot
Канал:  https://t.me/chisla_vlasti
```
Это часть UI сайта (`Cta.tsx`), не программная интеграция — просто
внешние ссылки в блоках статей.

### Уведомления о публикации
Не реализовано. `autopilot/telegram.js` не написан, `publish.js` не
отправляет никаких сообщений. Ориентировочный формат сообщения на случай
будущей реализации — см. `docs/AUTOPILOT.md`, раздел «Уведомление в
Telegram».

## Сброс кеша при ручном обновлении статьи

`site/app/api/revalidate/route.ts` — защищённый секретом route handler,
единственный собственный API-эндпоинт сайта. Принимает
`POST /api/revalidate?secret=...&path=/url/` и вызывает `revalidatePath()`
для этого URL — мгновенно сбрасывает ISR-кеш конкретной страницы (иначе
правка была бы не видна до истечения суточного окна `revalidate`).
Используется скриптом `scripts/update-article.sh` при доработке уже
опубликованной статьи. Подробности механизма — `docs/ARCHITECTURE.md`.

## Переменные окружения

`site/.env` (НЕ в git, создаётся вручную на сервере):
```
REVALIDATE_SECRET=<случайная строка, см. docs/DEPLOYMENT.md>
```
Это единственная переменная окружения, реально используемая сегодня.
Скриптам автопилота (`publish.js`, `linkbuilder.js`,
`update-planned-urls.js`, `build-anchors.js`, `validate-clusters.js`)
переменные окружения не нужны — они работают с локальной файловой
системой без внешних API-ключей.

Если в будущем появится `generate.js` или `telegram.js`, им
потребуются дополнительные переменные (не созданы сегодня, не используются):
```
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...
```
`.env` не коммитится в Git — это правило остаётся в силе вне зависимости
от того, какие переменные там реально нужны на данный момент.