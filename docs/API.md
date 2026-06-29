# Внешние API

## Anthropic API

### Назначение
Генерация JSON карточки (Промпт 2), валидация, генерация статьи (Промпт 3).

### Модель
```
claude-sonnet-4-6
```

### Конфигурация
```javascript
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
```

### Вызов
```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 8000,
  system: systemPrompt,   // промпт + скилы
  messages: [
    { role: 'user', content: userMessage }
  ]
})
```

### Лимиты
```
Запросов в минуту:   50 (Tier 1)
Токенов в минуту:    40 000 (Tier 1)
Макс. токенов/ответ: 8 192
```

### Стоимость (приблизительно)
```
Промпт 2 (карточка):   ~2 000 токенов  → $0.006
Промпт 3 (статья):     ~6 000 токенов  → $0.018
Валидатор:             ~1 000 токенов  → $0.003
Итого на статью:                       ~$0.027
50 статей (батч):                      ~$1.35
```

### Переменные окружения
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Telegram Bot API

### Назначение
Уведомления о публикации и ошибках генерации.

### Конфигурация
```javascript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID
```

### Сообщения

**Успешная публикация:**
```
✓ Опубликована новая статья

Название: [h1]
URL: [url]
Тип: [page_type]
Осталось в очереди: [count]
```

**Очередь пуста:**
```
⚠️ Очередь статей пуста
Осталось дней без публикаций: 0
Запусти генерацию батча: node generate.js
```

**Ошибка генерации:**
```
✗ Ошибка генерации кластера [id]
Шаг: [prompt2 / validator / prompt3]
Причина: [error message]
Файл: /content/error/cluster_[id].json
```

### Переменные окружения
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...
```

---

## Переменные окружения (все)

Хранятся в `.env` файле на VPS. Не коммитятся в Git.

```
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...

# Пути (опционально, если не дефолтные)
CONTENT_DIR=/content
```

---

## Обработка ошибок API

| Ошибка | Действие |
|--------|----------|
| 429 Rate limit | Пауза 60 сек, повтор |
| 500 Server error | Пауза 30 сек, повтор 3 раза |
| 401 Auth error | Остановить батч, уведомление |
| Timeout | Повтор 2 раза, затем skip |
