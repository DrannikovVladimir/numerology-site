# CLAUDE.md

## Проект
Нумерологический сайт на русском языке.
Контент — JSON-статьи, рендерятся динамически через Next.js.

## Структура репозитория
```
/site/                        ← Next.js 14 сайт (здесь вся разработка)
  /app/
    page.tsx                  ← главная страница (hero + сетка хабов, OG теги)
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
    /blocks/
      Paragraph.tsx           ← поддерживает Markdown-ссылки [текст](url)
      H2.tsx, H3.tsx          ← якоря через slugify, hover-ссылка #
      Fact.tsx, Quote.tsx, Table.tsx, List.tsx
      Callout.tsx, FactRow.tsx, Cta.tsx, Faq.tsx, Links.tsx
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
  tailwind.config.ts          ← палитра "тёплый пергамент"

/content/                     ← JSON-статьи и изображения (вне /site/)
  semantic_clusters.json      ← реестр всех 178 кластеров
  /published/                 ← 9 готовых hub-статей
  /pending/, /error/          ← не используются пока

/autopilot/
  update-planned-urls.js      ← обновляет site/content/planned-urls.json
  /prompts/
    prompt_02_onpage.md
    prompt_03_generator.md
    /skills/skill_01..08*.md

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
- Главная страница (hero + сетка 9 хабов) с OG тегами
- Header (sticky, бургер-меню с полным списком хабов) и Footer
- Хлебные крошки (2 уровня для hub, 3 для spoke)
- Оглавление из H2-блоков статьи
- Кнопка ScrollToTop
- Якоря на H2/H3 заголовках через slugify
- Поддержка Markdown-ссылок [текст](url) в параграфах
- Favicon и иконки для всех платформ

### Роутинг и SEO
- Catch-all роут /[...slug]/page.tsx:
  - читает статью из content/published/{slug}.json
  - если файла нет, но url в planned-urls.json → "страница в разработке"
  - если url нигде не числится → кастомная 404 со ссылками на хабы
- Open Graph + Twitter Card теги на всех страницах
- Canonical URL
- JSON-LD разметка (BreadcrumbList + Article + FAQPage если ≥2 вопросов)
- sitemap.xml (автогенерация из published статей)
- robots.txt

### Контент
- 9 hub-статей опубликованы в content/published/
- Изображения для всех 9 хабов в site/public/images/hub/
- CTA-правило: 2 CTA на бота (разные формулировки) + 1 на канал (mid_article_channel)
- nav_title поле в каждой статье — короткое название для крошек

### Скрипты
- node autopilot/update-planned-urls.js — обновляет planned-urls.json
  (запускать после добавления новых статей в content/published/)

## Не сделано / следующие шаги
- Spoke и standalone страницы (контент + проверка роутинга)
- Логотип в хедере (сейчас текст, нужна иконка)
- Мобильная полировка
- Автопилот, хранилище, деплой — намеренно не трогаем

## Формат JSON статьи (ключевые поля)
```json
{
  "page_id": "slug",
  "page_type": "hub | spoke | standalone",
  "hub_id": null,
  "nav_title": "Короткое название",
  "url": "/url/",
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

## Правила
- Комментарии в коде на русском языке
- Вся документация лежит в /docs/
- Структура блоков — /autopilot/prompts/skills/skill_07_html_components.md
- Структура страниц — /docs/SITE.md
- Домен пока плейсхолдер https://example.com — заменить везде когда появится

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд