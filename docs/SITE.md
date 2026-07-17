# Структура сайта

## Главная страница

Полноценный лендинг (`site/app/page.tsx`), сверху вниз:
- **Hero** — H1, подзаголовок, 2 CTA (бот / "Изучить основы"), декоративная
  картинка справа (компас или свиток — Flux, промпты см. историю чата;
  файл на месте, `site/public/images/hero/hero-visual.png`)
- **Матрица судьбы** — тёмный акцент-блок (bg-ink), live-калькулятор
  психоматрицы (`PsychomatrixCalculator.tsx`), ссылка на "квадрат
  Пифагора" как второе имя метода
- **Разделы нумерологии** — заголовок с кластерным ключом + вступление +
  сетка 9 хабов, у каждой карточки своя иконка lucide-react
- **Что такое числа в нумерологии** — 3 тезиса с иконками
  (Hash/Calendar/Compass)
- **Рассчитать число судьбы прямо сейчас** — тёмный акцент-блок
  (bg-teal), live-калькулятор (`DestinyCalculator.tsx`), учитывает
  мастер-числа 11/22/33, ведёт на бота
- **Что расскажет о вас нумерология** — 6 тезисов с PNG-иконками
  (промпты под Flux в истории чата; файлы на месте,
  `site/public/images/home/icon-*.png`)
- **Девять чисел — девять характеров** — колесо чисел 1-9
  (`NumberWheel.tsx`), каждое число кликабельно → `/chislo-sudby/N/`
- **CTA на канал** — `Cta.tsx` с `position="mid_article_channel"`
- **Зеркальные числа на часах** — превью 00:00 / 11:11 / 22:22, ссылка
  на хаб часов

Финальный CTA-блок перед футером сознательно не планируется — расширение
главной пойдёт другим путём, не этим блоком.

## Типы страниц

**Hub** — широкая обзорная страница, точка входа в тему.
Связывает все дочерние spoke. Пишется вручную. Все 9 хабов написаны.

**Spoke** — узкая страница под конкретный элемент серии.
Генерируется вручную через чат по промптам. Всегда привязана к hub.

**Standalone** — самостоятельная страница без дочерних.
Генерируется вручную через чат по промптам. Привязана к ближайшему hub.

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
/                 ← лендинг, секции — см. выше
/sitemap.xml      ← генерируется динамически, ISR revalidate = 3600 (час)
/robots.txt
/404
/test-blocks/     ← тестовая страница со всеми типами блоков, robots: noindex
```

## Итого страниц
```
Hub:          9
Spoke:       ~160 + 9 под матрицу судьбы (по ячейкам; линии — разделы внутри
                   хаба и ячеек, не отдельные URL, см. CLAUDE.md)
Standalone:   13
Служебные:     4
──────────────────
Итого:       ~187 URL в реестре (см. meta.total в semantic_clusters.json —
              актуальное число может отличаться от указанного здесь)
```
Реестр `planned-urls.json` — источник истины по факту публикации;
пересобирается скриптом `autopilot/update-planned-urls.js` из содержимого
`content/published/`, не редактируется вручную.

Актуальное число реально сгенерированных и опубликованных статей на
данный момент — не в этом файле; см. `docs/CLAUDE.md`, раздел «Готово»,
и/или проверить напрямую на сервере (`ls content/published/ | wc -l`).

## Рендер страницы и кеширование

Каждая статья хранится как JSON с полем `blocks`.
Next.js рендерит блоки через компоненты из библиотеки.

Роут `/[...slug]/page.tsx` работает через **on-demand ISR**:
- `generateStaticParams()` возвращает пустой массив — конкретные slug'и не
  известны на этапе сборки
- `revalidate = 86400` (сутки) — первый запрос к любому URL рендерит
  страницу «вживую» и сохраняет результат в кеш; все последующие запросы
  к этому же URL в течение суток отдаются из кеша мгновенно

Публикация новой статьи не требует пересборки сайта. Проверено:
`x-nextjs-cache: MISS` на первый запрос, `HIT` — на все последующие в
течение суток. Полный механизм и почему `generateStaticParams` обязателен
для срабатывания `revalidate` — `docs/ARCHITECTURE.md`.

Если статью нужно доработать уже после публикации (добавить картинку,
раздел и т.п.) — суточного окна кеша ждать не нужно: `POST /api/revalidate`
(`app/api/revalidate/route.ts`, защищён секретом) сбрасывает кеш конкретного
URL мгновенно. Используется через `scripts/update-article.sh`, не напрямую.

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
Статья без изображения — легальный сценарий: рендерится без блока
`<figure>`, JSON-LD корректно опускает поле `image` (оно опционально в
`ArticleForJsonLd`). Оптимизация изображений в проде — через `next/image`
с пакетом `sharp` (установлен).

## SEO

Каждая страница содержит:
- `<title>` из поля `meta.title`
- `<meta name="description">` из поля `meta.description`
- `<h1>` из поля `meta.h1`
- Open Graph теги — `og:image` использует то же изображение статьи (`image`)
- Canonical URL и все внутренние ссылки построены с завершающим "/" —
  `next.config.mjs` задаёт `trailingSlash: true`. Без этой настройки
  прод-сборка отдаёт `308 Permanent Redirect` на каждой странице
- `robots` — задаётся явно: `index, follow` для реальных статей,
  `noindex, nofollow` для заглушки "в разработке", 404 и `/test-blocks/`.
  Отдельно от этого поля — на время тестирования сайт также закрыт от
  индексации на уровне Nginx (`X-Robots-Tag`), см. `docs/DEPLOYMENT.md`
- JSON-LD разметка (BreadcrumbList + Article + FAQPage при ≥2 вопросах) —
  см. `skill_08_jsonld_meta.md`. `image` в узле `Article` опционален
- `sitemap.xml` — читает `planned-urls.json` через `fs.readFile`, ISR с
  `revalidate = 3600`. Новая публикация появится в sitemap в течение часа,
  без пересборки сайта