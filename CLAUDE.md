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
  tailwind.config.ts          ← палитра "тёплый пергамент"

/content/                     ← JSON-статьи и изображения (вне /site/)
  semantic_clusters.json      ← реестр всех 178 кластеров
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
        skill_04_structure_hub.md
        skill_04b_structure_standalone.md
      /spoke/
        skill_05_chislo-sudby-1-9.md
        skill_05_chislo-sudby-mastery.md  ← [TODO] мастер-числа 11, 22, 33
        skill_05_sovmestimost.md
        skill_05_chasy-00-23.md
        skill_05_angelskie-chisla.md
        skill_05_mesyacy.md

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
- Spoke-страницы: числа судьбы 1, 2, 3 опубликованы — hub→spoke цикл проверен
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
- Контекстные ссылки в тексте — правило в prompt_03, приоритет опубликованным URL

### Скрипты
- node autopilot/update-planned-urls.js — обновляет planned-urls.json
  (запускать после добавления новых статей в content/published/)

## Не сделано / следующие шаги
- skill_05_chislo-sudby-mastery.md — скил для мастер-чисел 11, 22, 33
- linkbuilder.js — автоматическая простановка контекстных ссылок перед публикацией
- Мобильная полировка — не проверялась вживую
- Логотип в хедере — сейчас текст, нужна иконка лабиринта
- Деплой — VPS, Nginx, PM2, реальный домен вместо example.com
- Автопилот — generate.js, publish.js, telegram.js (намеренно не трогаем)

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

## Правила
- Комментарии в коде на русском языке
- Вся документация лежит в /docs/
- hub_id всегда через дефисы — брать точно из semantic_clusters.json
- Структура блоков — /autopilot/prompts/skills/skill_07_html_components.md
- Структура страниц — /docs/SITE.md
- Домен пока плейсхолдер https://example.com — заменить везде когда появится

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд