# CLAUDE.md

## Проект
Нумерологический сайт на русском языке.
Контент — JSON-статьи, рендерятся динамически через Next.js.

## Структура репозитория
```
/site/          ← Next.js 14 сайт (здесь вся разработка)
  /app/
    page.tsx              ← главная страница (hero + сетка хабов)
    layout.tsx             ← подключает Header/Footer, bg-parchment
    not-found.tsx          ← кастомная 404 (со ссылками на хабы)
    /[...slug]/page.tsx    ← catch-all роут статей
    /test-blocks/page.tsx  ← тестовая страница со всеми типами блоков
  /components/
    Header.tsx              ← sticky, бургер-меню (полный список хабов)
    Footer.tsx               ← сетка ссылок на 9 хабов
    /blocks/                ← 12 компонентов + BlockRenderer.tsx
  /content/
    planned-urls.json       ← реестр {url: true/false} — есть ли файл статьи
  tailwind.config.ts        ← палитра "тёплый пергамент"
/content/        ← JSON-статьи и изображения (вне /site/)
  semantic_clusters.json    ← реестр всех 176 кластеров
  /published/                ← готовые статьи (JSON по формату STORAGE.md)
  /pending/, /error/, /images/  ← не используются пока
/docs/           ← документация проекта
/autopilot/      ← скрипты генерации (не трогаем сейчас)
  /prompts/
    prompt_02_onpage.md, prompt_03_generator.md
    /skills/skill_01..07*.md
```

## Стек сайта
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript

## Цветовая палитра ("тёплый пергамент")
```
parchment: '#F2E4C9'   фон страницы
cream:     '#FBF3E3'   фон карточек
sand:      '#E0C9A0'   рамки
terracotta: { DEFAULT: '#7A3418', light: '#F0D5C4' }  основной акцент (CTA, fact)
teal:       { DEFAULT: '#1B4D4A', light: '#CDE8E4' }  второй акцент (quote, h2, callout info)
ink:        '#3D2B1F'   текст основной
inkMuted:   '#6B5A47'   текст вторичный
```

## Готово (текущий статус)
- Базовая структура Next.js, TypeScript, Tailwind, палитра настроена
- 12 компонентов блоков (paragraph, h2, h3, fact, quote, table, list,
  callout, fact_row, cta, faq, links) + BlockRenderer
- Главная страница (hero + сетка 9 хабов)
- Header (sticky, бургер-меню с полным списком хабов) и Footer
- Catch-all роут `/[...slug]/page.tsx`:
  - читает статью из `content/published/{slug}.json`
  - если файла нет, но url числится в `planned-urls.json` → страница "в разработке"
  - если url нигде не числится → кастомная 404 со ссылками на хабы
- CTA-блок (`text`/`url` из JSON, открывается в новой вкладке)
  - правило: максимум 2 CTA на Telegram-бота с разными формулировками
    + 1 CTA на Telegram-канал (`position: "mid_article_channel"`)
  - зафиксировано в `prompt_03_generator.md`
- Одна реальная hub-страница опубликована: `content/published/numerologiya.json`

## Не сделано / следующие шаги
- Остальные 8 hub-страниц (контент)
- Spoke и standalone страницы
- Внутренняя перелинковка между hub/spoke (компонент links есть, связь не проверена)
- Автопилот, хранилище, деплой — намеренно не трогаем

## Правила
- Комментарии в коде на русском языке
- Вся документация лежит в /docs/
- Структура блоков — /autopilot/prompts/skills/skill_07_html_components.md
- Структура страниц — /docs/SITE.md

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд