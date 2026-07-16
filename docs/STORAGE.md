# Хранилище

## Текущее состояние

Общего интерфейса хранилища (`storage.js`) не существует. Каждый скрипт и
каждая часть сайта читает и пишет JSON-файлы напрямую через `fs`:

| Кто | Что делает | Файлы |
|-----|-----------|-------|
| `app/[...slug]/page.tsx` | Читает статью по slug (`fs.readFile`) | `content/published/{slug}.json` |
| `app/sitemap.ts` | Читает реестр публикаций (`fs.readFile`, не статический import — см. прецедент ниже) | `site/content/planned-urls.json` |
| `app/api/revalidate/route.ts` | Не читает файлы — сбрасывает ISR-кеш конкретного URL по запросу | — (работает с кешем Next.js, не с диском) |
| `autopilot/publish.js` | Читает/перемещает файлы очереди | `content/pending/` → `content/published/` |
| `autopilot/update-planned-urls.js` | Пересобирает реестр публикаций с нуля | `content/semantic_clusters.json` + `content/published/` → `site/content/planned-urls.json` |
| `autopilot/linkbuilder.js` | Читает и перезаписывает статью | `content/pending/*.json` или `content/published/*.json` |
| `autopilot/build-anchors.js` | Пересобирает словарь анкоров | `content/semantic_clusters.json` + `site/content/planned-urls.json` → `content/anchors.json` |
| `autopilot/validate-clusters.js` | Только читает, ничего не пишет | `content/semantic_clusters.json` |

Если в будущем появится абстракция хранилища или миграция на БД — начинать
нужно с замены этих прямых обращений к `fs` во всех перечисленных местах,
а не только в одном скрипте.

## Файловая структура

```
/content/
  semantic_clusters.json   ← реестр всех кластеров
  anchors.json             ← словарь анкоров для linkbuilder.js, пересобирается
                              автоматически (autopilot/build-anchors.js),
                              не редактируется руками
  /pending/
    cluster_23.json
    cluster_24.json
  /published/
    cluster_10.json
    cluster_11.json
  /error/
    cluster_5.json         ← содержит описание ошибки (папка не используется на практике)
  /images/
    /hub/
    /standalone/
    /spoke/
```

### Формат cluster_N.json (статья)
```json
{
  "page_id": "chislo-sudby-7",
  "page_type": "spoke",
  "hub_id": "chislo-sudby",
  "nav_title": "Число судьбы 7",
  "url": "/chislo-sudby/7/",
  "template": "chislo-sudby-1-9",
  "primary_keyword": "число судьбы 7",
  "cluster_keywords": [],
  "meta": {
    "title": "...",
    "description": "...",
    "h1": "..."
  },
  "image": "/content/images/spoke/chislo-sudby-7.jpg",
  "image_alt": "описание картинки",
  "blocks": [],
  "lsi_keywords": [],
  "faq": [],
  "internal_links": {
    "up": null,
    "horizontal": [],
    "down": []
  },
  "tov": "мистический экспертный",
  "word_count_target": 1200,
  "date_published": null,
  "date_modified": null,
  "status": "pending"
}
```
Поля `date_published`/`date_modified` — у только что сгенерированной статьи
эти ключи отсутствуют в JSON вовсе (не `null`, а не заданы). Добавляются
скриптом `autopilot/publish.js` в момент публикации.
`hub_id` должен быть через дефис (`chislo-sudby`), но на практике иногда
генерируется с подчёркиванием (`chislo_sudby`) — известное расхождение,
см. `docs/CLAUDE.md`, раздел «Не сделано».
`status` — статус генерации (`"pending"` → `"done"` после написания статьи),
не путать со статусом публикации — это отдельно, `planned-urls.json` в
`site/content/`.

### Формат semantic_clusters.json
Верхний уровень — объект с полем `clusters` (не голый массив):
```json
{
  "meta": { "total": 187 },
  "clusters": [
    {
      "id": 23,
      "page_id": "chislo_sudby_7",
      "title": "Число судьбы 7",
      "content_type": "info",
      "page_type": "spoke",
      "hub_id": "chislo_sudby",
      "url": "/chislo-sudby/7/",
      "template": "chislo-sudby-1-9",
      "primary_keyword": "число судьбы 7",
      "frequency": 1200,
      "status": "pending",
      "created_at": "2026-06-29T13:55:56.845Z",
      "updated_at": "2026-06-29T13:55:56.845Z",
      "cluster_keywords": []
    }
  ]
}
```
Важно: в реестре `hub_id` и `page_id` хранятся **через подчёркивание** —
это внутренний формат реестра. При генерации статьи это поле должно
конвертироваться в дефис для `hub_id` (см. правило в `CLAUDE.md`), но
конвертация выполняется непоследовательно — часть статей содержит
`hub_id` с подчёркиванием, унаследованным из реестра буквально.

`url` в реестре должен быть только через дефис — опечатка в этом поле
(например, `_i_` вместо `-i-`) делает статью «невидимой» для
`update-planned-urls.js`, потому что имя файла строится из `url` по
алгоритму `join("-")`, и оно перестаёт совпадать с реальным именем файла.

`template` — используется `autopilot/build-anchors.js` для выбора логики
склонения анкоров.

## Формат planned-urls.json
Плоский объект `{url: true/false}`. Полностью пересобирается скриптом
`autopilot/update-planned-urls.js` на основе того, что реально лежит в
`content/published/` — не редактируется вручную, любые ручные правки
будут перезаписаны при следующем запуске скрипта.

## Возможная будущая миграция (не начата)

Если объём статей вырастет (в документации ранее упоминался порог ~500)
или понадобится аналитика/фильтрация, может иметь смысл перейти на БД.
На сегодня это не спланировано и не начато — ни схемы, ни скрипта
миграции нет. Если решение будет принято, отправная точка — вынести
операции из таблицы выше в общий модуль, а не проектировать схему БД
заранее.