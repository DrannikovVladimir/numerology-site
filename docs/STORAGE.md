# Хранилище

## Принцип

Все операции с данными — только через `storage.js`.
Остальной код не знает где и как хранятся данные.
Миграция с JSON на PostgreSQL — только в `storage.js`.

## Интерфейс

```javascript
// Кластеры
await storage.getClusters({ type, status, limit })
await storage.updateClusterStatus(id, status)

// Статьи
await storage.saveArticle(article)
await storage.getNextPending()
await storage.markPublished(id)
await storage.markError(id, error)

// Очередь
await storage.getPendingCount()
await storage.getPublishedCount()
```

## Текущая реализация — JSON файлы

### Структура
```
/content/
  semantic_clusters.json   ← реестр всех кластеров
  /pending/
    cluster_23.json
    cluster_24.json
  /published/
    cluster_10.json
    cluster_11.json
  /error/
    cluster_5.json         ← содержит описание ошибки
  /images/
    /hub/
    /standalone/
    /spoke/
```

### Формат cluster_N.json
```json
{
  "page_id": "chislo-sudby-7",
  "page_type": "spoke",
  "hub_id": "chislo-sudby",
  "url": "/chislo-sudby/7/",
  "primary_keyword": "число судьбы 7",
  "cluster_keywords": [],
  "meta": {
    "title": "...",
    "description": "...",
    "h1": "..."
  },
  "blocks": [],
  "lsi_keywords": [],
  "faq": [],
  "internal_links": {},
  "image": "/content/images/spoke/chislo-sudby-7.jpg",
  "tov": "мистический экспертный",
  "word_count_target": 1200,
  "published_at": null,
  "status": "pending"
}
```

### Формат semantic_clusters.json
```json
[
  {
    "id": 23,
    "url": "/chislo-sudby/7/",
    "title": "Число судьбы 7",
    "type": "spoke",
    "hub_id": "chislo-sudby",
    "primary_keyword": "число судьбы 7",
    "frequency": 1200,
    "status": "pending"
  }
]
```

## Будущая реализация — PostgreSQL

### Когда мигрировать
- Статей больше 500
- Нужна аналитика и фильтрация
- Несколько экземпляров автопилота

### Схема БД
```sql
clusters (
  id, url, title, type,
  hub_id, primary_keyword,
  frequency, status,
  created_at, updated_at
)

pages (
  id, cluster_id, url,
  meta_title, meta_description, h1,
  blocks JSONB,
  image, word_count,
  published_at, status,
  created_at
)

generation_log (
  id, cluster_id, step,
  status, error,
  created_at
)
```

### Миграция
```bash
node autopilot/migrate.js --from json --to postgres
```
Скрипт читает все JSON файлы и записывает в БД.
Интерфейс `storage.js` не меняется.
