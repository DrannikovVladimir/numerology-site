# CLAUDE.md

## Проект
Нумерологический сайт на русском языке.
Контент — JSON-статьи, рендерятся динамически через Next.js с ISR-кешированием.

## Структура репозитория
```
/site/                        ← Next.js 14 сайт
  /app/
    page.tsx                  ← главная страница — структура секций см. docs/SITE.md
    layout.tsx                ← Header/Footer, bg-parchment, favicon, metadata
    not-found.tsx             ← кастомная 404 (со ссылками на хабы)
    sitemap.ts                ← /sitemap.xml, fs.readFile + ISR (revalidate 3600)
    robots.ts                 ← /robots.txt
    /[...slug]/page.tsx       ← catch-all роут статей, on-demand ISR
                                 (revalidate 86400) — см. docs/ARCHITECTURE.md
    /api/revalidate/route.ts  ← точечный сброс ISR-кеша конкретного URL
                                 (POST + secret), см. docs/ARCHITECTURE.md
    /test-blocks/page.tsx     ← тестовая страница со всеми типами блоков
  /components/
    Header.tsx                ← лого — SVG-лабиринт (currentColor, тот же мотив,
                                 что в CTA-блоках статей)
    Footer.tsx, Breadcrumbs.tsx, TableOfContents.tsx, ScrollToTop.tsx
    DestinyCalculator.tsx, PsychomatrixCalculator.tsx ← формулы — зеркало бота
      (src/bot/interpretations/karma/karma.js), править синхронно
    NumberWheel.tsx            ← координаты точек считаются в коде, не хардкодятся
    /blocks/
      13 компонентов + BlockRenderer.tsx — источник истины по TypeScript-схеме блоков
  /lib/
    slugify.ts
    jsonld.ts                 ← сборка JSON-LD; ArticleForJsonLd.image опционален;
                                 publisher.logo → /images/logo.png
  /content/
    planned-urls.json         ← реестр {url: true/false}, НЕ в git (см. ниже)
  /public/
    favicon*, apple-touch-icon.png, web-app-manifest-*.png, site.webmanifest
    /images/hub/, /images/home/, /images/logo.png
  next.config.mjs             ← trailingSlash: true (обязательна)
  package.json                ← включает sharp
  tailwind.config.ts          ← палитра "тёплый пергамент"
  .env                        ← НЕ в git. REVALIDATE_SECRET — создаётся вручную
                                 на сервере, см. docs/DEPLOYMENT.md

/content/
  semantic_clusters.json      ← реестр кластеров, В GIT, редактируется только вручную
  anchors.json                ← НЕ в git, пересобирается build-anchors.js
  /pending/, /published/, /error/  ← НЕ в git, см. «Git и синхронизация»

/autopilot/
  publish.js                  ← pending → published, CLI: --count N, --dry-run
  update-planned-urls.js      ← пересобирает planned-urls.json из published/
  linkbuilder.js               ← простановка контекстных ссылок (--file/--dir/--dry-run)
  build-anchors.js            ← сборка anchors.json
  validate-clusters.js        ← проверка semantic_clusters.json (дефис/подчёркивание
                                 в url, дубли id, обязательные поля) — запускать
                                 перед коммитом. Протестирован, 0 ошибок
  /prompts/                   ← prompt_02_onpage.md, prompt_03_generator.md, /skills/

/scripts/
  sync-content.sh              ← rsync content/pending/ на сервер (новые статьи,
                                  --ignore-existing)
  update-article.sh            ← доставка правки уже опубликованной статьи
                                  (перезапись) + сброс её ISR-кеша

/docs/                         ← документация проекта
.gitignore                     ← контент исключён (content/pending, content/published,
                                  content/anchors.json, site/content/planned-urls.json)
                                  + node_modules, .env, .next
```

## Git и синхронизация с VPS
Git отслеживает только код (`site/`, `autopilot/`-скрипты, `scripts/`,
`docs/`, `content/semantic_clusters.json`). Файлы, которые мутируют
скрипты на сервере (`content/pending/`, `content/published/`,
`content/anchors.json`, `site/content/planned-urls.json`), исключены из
git и доставляются отдельно через `rsync`. Подробности и обоснование —
`docs/ARCHITECTURE.md`, раздел «Два независимых канала синхронизации»;
пошаговая настройка — `docs/DEPLOYMENT.md`.

Три сценария синхронизации:
1. **Новые статьи** → `scripts/sync-content.sh` → `content/pending/` на
   сервере → cron публикует по расписанию
2. **Правка уже опубликованной статьи** → `scripts/update-article.sh` →
   перезаписывает файл в `content/published/` на сервере + сбрасывает
   ISR-кеш этого URL мгновенно
3. **Код** → `git push` → GitHub Actions → `git pull` (+ пересборка, если
   менялся `site/`/`autopilot/`)

## Стек сайта
Next.js 14 (App Router), Tailwind CSS, TypeScript.

## Цветовая палитра ("тёплый пергамент")
```
parchment: '#F2E4C9'   cream: '#FBF3E3'   sand: '#E0C9A0'
terracotta: '#7A3418' (light '#F0D5C4')  — акцент CTA/fact
teal: '#1B4D4A' (light '#CDE8E4')        — акцент quote/h2/callout info
ink: '#3D2B1F'   inkMuted: '#6B5A47'
```

## Готово (текущий статус)
- Сайт: 13 типов блоков, Header/Footer, breadcrumbs, TOC, SEO/JSON-LD,
  прод-сборка проверена целиком. Структура страниц, включая главную —
  `docs/SITE.md`
- **Кеширование (ISR)**: статьи — `revalidate 86400`, sitemap —
  `revalidate 3600`, оба поверх `fs.readFile` (не статический импорт).
  Плюс точечный сброс кеша конкретного URL по требованию
  (`/api/revalidate`) — для случаев ручного редактирования уже
  опубликованной статьи. Механизм — `docs/ARCHITECTURE.md`
- `sharp` установлен, логотип подключён (хедер — SVG-лабиринт, JSON-LD —
  `/images/logo.png`)
- Автопилот: `publish.js`, `linkbuilder.js`, `update-planned-urls.js`,
  `build-anchors.js`, `validate-clusters.js` реализованы и проверены
  end-to-end вручную. Подробности — `docs/AUTOPILOT.md`
- Git/rsync разделение: `.gitignore` настроен, контент убран из индекса
  и запушен, `scripts/sync-content.sh` и `scripts/update-article.sh`
  написаны (не протестированы на реальном сервере — VPS ещё нет)
- Контентная система: `prompt_02_onpage.md`/`prompt_03_generator.md` +
  skill-файлы. `hub_id` и анкор хлебной крошки на хаб теперь имеют явные
  правила в Промпте 2 (конвертация подчёркивания в дефис; анкор берётся
  дословно из `title` hub-кластера) — см. `docs/CONTENT.md`
- Формат JSON статьи и правила хранения — `docs/STORAGE.md`

## Не сделано / следующие шаги
- GitHub Actions workflow (`.github/workflows/deploy.yml`) — не создан
- cron на сервере — не установлен (сервер не поднят)
- VPS не поднят вообще — весь `docs/DEPLOYMENT.md` пока план, не факт
- `scripts/sync-content.sh`/`update-article.sh` не протестированы на
  реальном сервере — только написаны
- `REVALIDATE_SECRET` нужно сгенерировать и создать `site/.env` на
  сервере вручную при первом деплое (в git не попадёт никогда)
- Зонирование `linkbuilder.js` по H3 вместо H2 + общий потолок ссылок —
  решение не принято, см. `docs/AUTOPILOT.md`
- Существующие 34 статьи не переписаны под новые правила Промпта 2 —
  регистр их крошек и `hub_id` могут остаться со старыми значениями,
  если не исправлять задним числом (для этого есть
  `scripts/update-article.sh`, но точечно, вручную)
- Логотип для JSON-LD использует `web-app-manifest-512x512.png` как
  временный источник
- Реальный домен вместо `chislavlasti.com`
- `generate.js` (батч-генерация), `telegram.js` (уведомления) — не реализованы
- Изображения для главной не сгенерированы: hero
  (`site/public/images/hero/hero-visual.png`) и 6 иконок
  (`site/public/images/home/icon-*.png`)

## Правила
- Комментарии в коде на русском языке
- Вся документация — `/docs/`
- `hub_id` в статье — всегда через дефис; в `semantic_clusters.json` поле
  хранится через подчёркивание, конвертация — на этапе Промпта 2 (правило
  явно прописано, см. `docs/CONTENT.md`)
- Структура блоков — `/autopilot/prompts/skills/skill_07_html_components.md`
- Структура страниц — `/docs/SITE.md`
- Домен-плейсхолдер `https://chislavlasti.com` — заменить везде, когда появится
- Расчётная логика на сайте (live-калькуляторы) — точное зеркало кода бота
  (`src/bot/interpretations/karma/*.js`, `core.js`); при расхождении
  источник истины бот, не сайт
- Данные, читаемые в рантайме серверными компонентами, — только через
  `fs.readFile`, не через статический `import ... from "*.json"`
  (статический импорт замораживается на этапе сборки)
- `semantic_clusters.json` редактируется только вручную; перед коммитом
  прогонять `node autopilot/validate-clusters.js`
- Мутирующие файлы контента (`content/pending/`, `content/published/`,
  `content/anchors.json`, `site/content/planned-urls.json`) не коммитятся —
  доставка через `scripts/sync-content.sh` (новые) или
  `scripts/update-article.sh` (правки существующих), не через git
- Правка уже опубликованной статьи требует сброса ISR-кеша
  (`scripts/update-article.sh`) — простой перезаписи файла на сервере
  недостаточно, изменения не появятся на сайте до истечения текущего
  окна `revalidate`

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд