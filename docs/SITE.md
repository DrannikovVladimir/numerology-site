# Структура сайта

## Типы страниц

**Hub** — широкая обзорная страница, точка входа в тему.
Связывает все дочерние spoke. Пишется вручную.

**Spoke** — узкая страница под конкретный элемент серии.
Генерируется автоматически. Всегда привязана к hub.

**Standalone** — самостоятельная страница без дочерних.
Генерируется автоматически. Привязана к ближайшему hub.

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
/                 ← лендинг
/sitemap.xml      ← генерируется автоматически
/robots.txt
/404
```

## Итого страниц
```
Hub:          9
Spoke:       ~160
Standalone:   13
Служебные:     4
──────────────────
Итого:       ~186
```

## Рендер страницы

Каждая статья хранится как JSON с полем `blocks`.
Next.js рендерит блоки через компоненты из библиотеки.

### Типы блоков
```
paragraph   ← текстовый абзац
h2          ← заголовок раздела + lead
h3          ← заголовок подраздела
fact        ← выделенный факт
quote       ← цитата или сильное утверждение
table       ← таблица с данными
list        ← маркированный или нумерованный список
callout     ← info / tip / warning
fact_row    ← факты в ряд (архетип, стихия, планета...)
faq         ← блок вопрос-ответ
links       ← список внутренних ссылок
cta         ← баннер (after_intro / end_of_article)
```

## Изображения

```
Hub и Standalone  → вручную через Syntx.ai
Spoke             → вручную через Syntx.ai, ~30 в месяц
OG-изображения    → генерируются автоматически через код
```

## SEO

Каждая страница содержит:
- `<title>` из поля `meta.title`
- `<meta name="description">` из поля `meta.description`
- `<h1>` из поля `meta.h1`
- Open Graph теги
- Canonical URL
- JSON-LD разметка (Article)
- `sitemap.xml` — обновляется автоматически при публикации
