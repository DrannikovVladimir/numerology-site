# CLAUDE.md

## Проект
Нумерологический сайт на русском языке.
Контент — JSON-статьи, рендерятся динамически через Next.js.

## Структура репозитория
```
/site/                        ← Next.js 14 сайт (здесь вся разработка)
  /app/
    page.tsx                  ← главная страница — см. подробный список секций ниже
    layout.tsx                ← Header/Footer, bg-parchment, favicon, metadata
    not-found.tsx             ← кастомная 404 (со ссылками на хабы)
    sitemap.ts                ← генерация /sitemap.xml
    robots.ts                 ← генерация /robots.txt
    /[...slug]/page.tsx       ← catch-all роут статей
    /test-blocks/page.tsx     ← тестовая страница со всеми типами блоков
  /components/
    Header.tsx                ← sticky, бургер-меню (полный список хабов)
    Footer.tsx                ← сетка ссылок на 9 хабов
    Breadcrumbs.tsx           ← хлебные крошки (2 уровня hub, 3 уровня spoke)
    TableOfContents.tsx       ← оглавление из H2-блоков статьи
    ScrollToTop.tsx           ← кнопка возврата наверх (клиентский)
    DestinyCalculator.tsx     ← live-калькулятор числа судьбы (главная), учитывает мастер-числа 11/22/33
    PsychomatrixCalculator.tsx ← live-калькулятор матрицы судьбы/квадрата Пифагора (главная)
                                  формула — точное зеркало calcPythagoreanMatrix() из бота
                                  (src/bot/interpretations/karma/karma.js), править синхронно
    NumberWheel.tsx            ← инфографика «колесо чисел» 1-9 (главная), координаты точек считаются
                                  тригонометрией в коде, не хардкодятся вручную
    /blocks/
      Paragraph.tsx           ← поддерживает Markdown-ссылки [текст](url)
      H2.tsx, H3.tsx          ← якоря через slugify, hover-ссылка #
      Fact.tsx, Quote.tsx, Table.tsx, List.tsx
      Callout.tsx             ← варианты: tip, warning, info, important, practice
      FactRow.tsx, Cta.tsx, Faq.tsx, Links.tsx
      Image.tsx               ← next/image с caption
      BlockRenderer.tsx       ← 13 типов блоков
  /lib/
    slugify.ts                ← утилита для генерации id из текста
    jsonld.ts                 ← сборка JSON-LD (BreadcrumbList, Article, FAQPage)
  /content/
    planned-urls.json         ← реестр {url: true/false} — опубликована ли статья
  /public/
    favicon.ico, favicon.svg, favicon-96x96.png
    apple-touch-icon.png
    web-app-manifest-192x192.png, web-app-manifest-512x512.png
    site.webmanifest
    /images/hub/              ← изображения для hub-статей
    /images/home/             ← иконки для блока «Что расскажет о вас нумерология» (главная)
  tailwind.config.ts          ← палитра "тёплый пергамент"

/content/                     ← JSON-статьи и изображения (вне /site/)
  semantic_clusters.json      ← реестр кластеров, актуальное число — см. meta.total в самом файле
  /published/                 ← 9 hub-статей + spoke-статьи (числа судьбы 1, 2, 3)
  /pending/, /error/          ← не используются пока

/autopilot/
  update-planned-urls.js      ← обновляет site/content/planned-urls.json
  linkbuilder.js              ← [TODO] автоматическая простановка контекстных ссылок
  /prompts/
    prompt_02_onpage.md       ← генератор карточки кластера
    prompt_03_generator.md    ← генератор статьи
    /skills/
      skill_01_seo_role.md
      skill_02_tov_numerology.md
      skill_03_content_rules.md
      skill_06_checklist.md
      skill_07_html_components.md
      skill_08_jsonld_meta.md
      skill_05_base.md        ← базовые правила для всех spoke-страниц
      /hub/
        skill_04_structure_hub.md   ← содержит правило-исключение про перелинковку
                                       хабов без собственных spoke (кв. Пифагора → матрица судьбы)
        skill_04b_structure_standalone.md
      /spoke/
        skill_05_chislo-sudby-1-9.md
        skill_05_chislo-sudby-mastery.md  ← мастер-числа 11, 22, 33 — готов
        skill_05_sovmestimost.md
        skill_05_chasy-00-23.md
        skill_05_angelskie-chisla.md
        skill_05_mesyacy.md
        skill_05_matrica-sudby.md         ← методика матрицы судьбы, 9 spoke (по ячейкам),
                                              линии — врезки/раздел хаба, не отдельные URL

/docs/                        ← документация проекта
```

## Стек сайта
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript

## Цветовая палитра ("тёплый пергамент")
```
parchment:  '#F2E4C9'  фон страницы
cream:      '#FBF3E3'  фон карточек
sand:       '#E0C9A0'  рамки
terracotta: { DEFAULT: '#7A3418', light: '#F0D5C4' }  основной акцент (CTA, fact)
teal:       { DEFAULT: '#1B4D4A', light: '#CDE8E4' }  второй акцент (quote, h2, callout info)
ink:        '#3D2B1F'  текст основной
inkMuted:   '#6B5A47'  текст вторичный
```

## Готово (текущий статус)

### Сайт
- Базовая структура Next.js 14, TypeScript, Tailwind, палитра настроена
- 13 компонентов блоков (paragraph, h2, h3, fact, quote, table, list,
  callout, fact_row, cta, faq, links, image) + BlockRenderer
- Callout поддерживает варианты: tip, warning, info, important, practice
- Header (sticky, бургер-меню с полным списком хабов) и Footer
- Хлебные крошки (2 уровня для hub, 3 для spoke)
- Оглавление из H2-блоков статьи
- Кнопка ScrollToTop
- Якоря на H2/H3 заголовках через slugify
- Поддержка Markdown-ссылок [текст](url) в параграфах
- Favicon и иконки для всех платформ

### Главная страница
Полноценный лендинг, сверху вниз:
- **Hero** — H1, подзаголовок, 2 CTA (бот / "Изучить основы"), декоративная
  картинка справа (компас или свиток — Flux, промпты см. историю чата)
- **Матрица судьбы** — тёмный акцент-блок (bg-ink), live-калькулятор психоматрицы
  (`PsychomatrixCalculator.tsx`), ссылка на "квадрат Пифагора" как второе имя метода
- **Разделы нумерологии** — заголовок с кластерным ключом + вступление + сетка 9 хабов,
  у каждой карточки своя иконка lucide-react
- **Что такое числа в нумерологии** — 3 тезиса с иконками (Hash/Calendar/Compass),
  подзаголовок с кластерными ключами
- **Рассчитать число судьбы прямо сейчас** — тёмный акцент-блок (bg-teal), live-калькулятор
  (`DestinyCalculator.tsx`), учитывает мастер-числа 11/22/33, ведёт на бота
- **Что расскажет о вас нумерология** — 6 тезисов (характер, предназначение,
  совместимость, деньги, любовь, здоровье) с крупными PNG-иконками (Flux,
  промпты в истории чата, лежат в site/public/images/home/)
- **Девять чисел — девять характеров** — колесо чисел 1-9 (`NumberWheel.tsx`),
  каждое число кликабельно → /chislo-sudby/N/
- **CTA на канал** — `Cta.tsx` с `position="mid_article_channel"`
- **Зеркальные числа на часах** — превью 00:00 / 11:11 / 22:22, ссылка на хаб часов
- Финальный CTA перед футером — сознательно отложен, ещё не сделан

### Роутинг и SEO
- Catch-all роут /[...slug]/page.tsx:
  - читает статью из content/published/{slug}.json
  - если файла нет, но url в planned-urls.json → "страница в разработке"
    (свой title "Страница в разработке", robots noindex, список хабов как на 404)
  - если url нигде не числится → кастомная 404 (not-found.tsx) со ссылками на хабы
- robots — задаётся явно в каждом случае, дефолт в layout.tsx на robots не влияет:
  - реальная статья → index, follow
  - "страница в разработке", 404, /test-blocks/ → noindex, nofollow
- layout.tsx: дефолтные title/description ("Нумерология" + короткое описание)
  вместо мусора из create-next-app — используются только если страница
  не задаёт свои метаданные
- Open Graph + Twitter Card теги на всех страницах
- Canonical URL
- JSON-LD разметка (BreadcrumbList + Article + FAQPage если ≥2 вопросов)
  - Article: image — обязательное поле, берётся из article.image напрямую
  - Article: datePublished/dateModified — из article.date_published/date_modified
    (если статья ещё не публиковалась через publish.js и полей нет, падает на
    текущую дату — актуально только для контента, изданного до появления скрипта)
- sitemap.xml (автогенерация из published статей)
- robots.txt

### Контент
- 28 статей опубликовано в content/published/ (9 hub + 19 spoke) — см. planned-urls.json
- Spoke опубликованы по сериям: числа судьбы (1, 2, 3, 11, 22, 33), совместимость
  (5 пар), часы (4), ангельские числа (3), месяцы (1) — hub→spoke цикл проверен
- «Квадрат Пифагора» — статья полностью готова (JSON с 3 изображениями),
  но ещё НЕ в content/published/ — последний шаг перед публикацией
- «Матрица судьбы» — готова методика расчёта и трактовки ячеек (см. ниже
  «Не сделано»), сама hub-статья ещё не написана, URL пока отдаёт заглушку
  «в разработке»
- Изображения для всех 9 хабов в site/public/images/hub/
- CTA-правило: 2 CTA на бота (разные формулировки) + 1 на канал (mid_article_channel)
- nav_title поле в каждой статье — короткое название для крошек

### Контентная система (промпты и скилы)
- prompt_02_onpage.md — генерирует карточку кластера (JSON-скелет)
- prompt_03_generator.md — генерирует финальную статью по карточке
- Скилы разделены на базовые и серийные:
  - skill_05_base.md — общие правила для всех spoke
  - /spoke/ папка — отдельный файл для каждой серии с уникальными блоками
- Протестированные серии: chislo-sudby-1-9, sovmestimost, chasy-00-23, angelskie-chisla, mesyacy
- matrica-sudby — методика написана (skill-файл готов, 9 spoke по ячейкам,
  линии — врезки на ячейках + раздел хаба, не отдельные страницы), контент
  по ней ещё не генерировался
- Контекстные ссылки в тексте — правило в prompt_03, приоритет опубликованным URL

### Скрипты
- node autopilot/update-planned-urls.js — обновляет planned-urls.json
  (запускать после добавления новых статей в content/published/)

## Не сделано / следующие шаги

**Матрица судьбы — структура утверждена, осталось написать статьи:**
- Финальная структура: 9 spoke-страниц (по одной на цифру 1-9), линии
  НЕ получают отдельных URL — решение принято сознательно (проверили
  реальный спрос: "линия" в широком поиске почти всегда относится к
  другой, гораздо более популярной системе "матрица судьбы" на 22
  арканах Таро — не к методу Александрова, который реализован у нас;
  подробности решения — в истории чата, при необходимости пересказать)
  Линии живут как врезки на страницах ячеек + отдельный раздел на хабе
- skill-файл переписан под реальные данные бота (`pythagorean_matrix.json`):
  7 уровней глубины на ячейку вместо 3, планета/стихия/домен/вопрос
- Источник интерпретаций для генерации — датасет бота, должен лежать в
  content/data/pythagorean-matrix.json (скопировать из бота, ещё не сделано)
- Сама hub-статья «Матрица судьбы» не написана, как и все 9 spoke

**Прочее:**
- linkbuilder.js — автоматическая простановка контекстных ссылок перед публикацией
- Мобильная полировка — не проверялась вживую
- Логотип в хедере — сейчас текст, нужна иконка лабиринта (SvgLabyrinth уже
  используется в CTA-блоках статей, в хедере не подключена)
- Логотип для JSON-LD (Organization/Article publisher.logo) — путь /images/logo.png,
  файла нет; нужно решить, какой файл использовать (см. public/, есть
  web-app-manifest-512x512.png — подходит по размеру)
- Деплой — VPS, Nginx, PM2, реальный домен вместо example.com
- Автопилот — generate.js, publish.js, telegram.js (намеренно не трогаем)
- Финальный CTA-блок перед футером на главной — сознательно отложен
- Изображения для главной ещё не сгенерированы и не положены на диск:
  hero (`site/public/images/hero/hero-visual.png`) и 6 иконок блока
  «Что расскажет о вас нумерология» (`site/public/images/home/icon-*.png`) —
  промпты под Flux см. в истории чата, без файлов на этих страницах будут
  битые картинки (сайт не упадёт, просто пусто)

## Формат JSON статьи (ключевые поля)
```json
{
  "page_id": "slug",
  "page_type": "hub | spoke | standalone",
  "hub_id": "через-дефисы (из semantic_clusters.json)",
  "nav_title": "Короткое название",
  "url": "/url/",
  "template": "chislo-sudby-1-9 | sovmestimost | chasy-00-23 | angelskie-chisla | mesyacy | null",
  "meta": { "title": "...", "description": "...", "h1": "..." },
  "image": "/images/hub/папка/файл.jpg",
  "image_alt": "описание картинки",
  "blocks": [],
  "faq": [],
  "internal_links": {
    "up": null,
    "horizontal": [],
    "down": []
  },
  "date_published": "2026-07-01",
  "date_modified": "2026-07-01",
  "status": "done"
}
```
`date_published`/`date_modified` проставляются автоматически скриптом
`autopilot/publish.js` в момент публикации — вручную в промптах не заполняются.

## Правила
- Комментарии в коде на русском языке
- Вся документация лежит в /docs/
- hub_id всегда через дефисы — брать точно из semantic_clusters.json
- Структура блоков — /autopilot/prompts/skills/skill_07_html_components.md
- Структура страниц — /docs/SITE.md
- Домен пока плейсхолдер https://example.com — заменить везде когда появится
- Любая расчётная логика на сайте (live-калькуляторы на главной) должна быть
  точным зеркалом соответствующей функции из кода бота
  (`src/bot/interpretations/karma/*.js`, `core.js`) — при любом расхождении
  источник истины бот, а не сайт. Прецедент: PsychomatrixCalculator.tsx
  содержал ошибку именно из-за расхождения с реальной формулой бота
  (первая цифра дня бралась буквально, а не как первая ненулевая)

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд