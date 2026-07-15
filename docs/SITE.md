# Структура сайта

## Типы страниц

**Hub** — широкая обзорная страница, точка входа в тему.
Связывает все дочерние spoke. Пишется вручную.

**Spoke** — узкая страница под конкретный элемент серии.
Генерируется автоматически (сейчас — вручную через чат по промптам). Всегда
привязана к hub.

**Standalone** — самостоятельная страница без дочерних.
Генерируется автоматически (сейчас — вручную через чат по промптам).
Привязана к ближайшему hub.

## Маршруты

### Hub-страницы
```
/numerologiya/
/chislo-sudby/
/matrica-sudby/
/kvadrat-pifagora/
/sovmestimost/
/numerologiya-imeni/
/numerologiya-na-chasakh/
/numerologiya-mesyaca/
/angelskie-chisla/
```
Все 9 hub-страниц опубликованы.

### Spoke-страницы
```
/chislo-sudby/1/  ...  /chislo-sudby/9/
/chislo-sudby/11/
/chislo-sudby/22/
/chislo-sudby/33/
/chislo-sudby/13/  /chislo-sudby/14/
/chislo-sudby/16/  /chislo-sudby/19/

/sovmestimost/1-i-1/  ...  /sovmestimost/9-i-9/

/numerologiya-na-chasakh/00-00/  ...  /numerologiya-na-chasakh/23-23/

/angelskie-chisla/111/  ...  /angelskie-chisla/999/

/numerologiya-mesyaca/yanvar/  ...  /numerologiya-mesyaca/dekabr/

/matrica-sudby/1/  ...  /matrica-sudby/9/
```

### Standalone-страницы
```
/numerologiya-po-date-rozhdeniya/
/vedicheskaya-numerologiya/
/znachenie-cifr/
/lichnyj-god/
/prognoz-na-god/
/denezhnyj-kod/
/grafik-sudby/
/numerologiya-kvartiry/
/numerologiya-telefona/
/karma-po-date-rozhdeniya/
/karmaticheskie-otnosheniya/
/matrica-sudby/sovmestimost/
/matrica-sudby/rasshifrovka/
```

### Служебные страницы
```
/                 ← лендинг, полный список секций — см. /docs/CLAUDE.md → «Главная страница»
/sitemap.xml      ← генерируется автоматически, статический роут (только при npm run build)
/robots.txt
/404
/test-blocks/     ← тестовая страница со всеми типами блоков, robots: noindex
```

## Итого страниц
```
Hub:          9  — все опубликованы
Spoke:       ~160 + 9 под матрицу судьбы (по ячейкам; линии — разделы внутри
                   хаба и ячеек, не отдельные URL, см. CLAUDE.md)
Standalone:   13
Служебные:     4
──────────────────
Итого:       ~187 URL в реестре (см. meta.total в semantic_clusters.json —
              актуальное число может отличаться от указанного здесь)
```

Опубликовано на данный момент: 34 статьи (9 hub + 25 spoke). Реестр
`planned-urls.json` — источник истины по факту публикации; пересобирается
скриптом `autopilot/update-planned-urls.js` из содержимого
`content/published/`, не редактируется вручную.

## Рендер страницы

Каждая статья хранится как JSON с полем `blocks`.
Next.js рендерит блоки через компоненты из библиотеки.
Роут `/[...slug]/page.tsx` — динамический (`ƒ` в выводе `next build`):
читает JSON-файл статьи с диска в момент запроса, без пререндера при сборке.
Публикация новой статьи не требует пересборки сайта для отображения самой
страницы — файл появляется в `content/published/`, и она сразу открывается.

### Типы блоков
```
paragraph   ← текстовый абзац
h2          ← заголовок раздела + lead
h3          ← заголовок подраздела
fact        ← выделенный факт
quote       ← цитата или сильное утверждение
table       ← таблица с данными
list        ← маркированный или нумерованный список
callout     ← info / tip / warning / important / practice
fact_row    ← факты в ряд (архетип, стихия, планета...)
faq         ← блок вопрос-ответ
links       ← список внутренних ссылок
cta         ← баннер (position: after_intro / after_calculation /
              end_of_article / mid_article_channel; поля heading, subtext,
              button_text, url)
image       ← отдельный блок картинки с caption
```
Типы и их точная TypeScript-схема — источник истины в
`site/components/blocks/BlockRenderer.tsx`.

## Изображения

```
Hub и Standalone  → вручную через Syntx.ai
Spoke             → вручную через Syntx.ai, ~30 в месяц
OG-изображения    → не генерируются отдельно, og:image = то же image статьи
```
Статья без изображения — легальный сценарий (см. AUTOPILOT.md): рендерится
без блока `<figure>`, JSON-LD корректно опускает поле `image` (оно
опционально в `ArticleForJsonLd`).

## SEO

Каждая страница содержит:
- `<title>` из поля `meta.title`
- `<meta name="description">` из поля `meta.description`
- `<h1>` из поля `meta.h1`
- Open Graph теги — `og:image` использует то же изображение статьи (`image`),
  отдельного OG-изображения не генерируется
- Canonical URL и все внутренние ссылки построены с завершающим "/" —
  `next.config.mjs` задаёт `trailingSlash: true`. Без этой настройки
  прод-сборка (`npm run build && npm start`) отдаёт `308 Permanent Redirect`
  на каждой странице при обращении по URL со слэшем (то есть по всем
  реальным ссылкам сайта), потому что дефолтное поведение Next.js без
  `trailingSlash` — канонический URL без слэша. В `npm run dev` эта
  проблема не проявляется. Проверено и исправлено.
- `robots` — задаётся явно на каждой странице: `index, follow` для реальных
  статей, `noindex, nofollow` для заглушки "в разработке", 404 и `/test-blocks/`
- JSON-LD разметка (BreadcrumbList + Article + FAQPage при ≥2 вопросах) —
  см. skill_08_jsonld_meta.md. `image` в узле `Article` опционален
  (`ArticleForJsonLd.image?: string`), добавляется только если у статьи
  есть картинка
- `sitemap.xml` — статический роут, читает `planned-urls.json` через
  статический `import`, зафиксированный на момент сборки (`npm run build`).
  Новые публикации **не появляются** в sitemap без пересборки сайта —
  подтверждённое поведение прод-режима, не баг (см. AUTOPILOT.md)