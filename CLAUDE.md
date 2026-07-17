# CLAUDE.md

## Проект
Нумерологический сайт на русском языке.
Контент — JSON-статьи, рендерятся динамически через Next.js с ISR-кешированием.

Домен: **chislavlasti.com** (куплен, DNS настроен, сервер поднят,
сайт живой — см. «Готово» ниже).

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
                                 publisher.logo → /images/logo.png;
                                 базовый URL — chislavlasti.com (плейсхолдер
                                 example.com заменён везде, см. «Готово»)
  /content/
    planned-urls.json         ← реестр {url: true/false}, НЕ в git (см. ниже)
  /public/
    favicon*, apple-touch-icon.png, web-app-manifest-*.png, site.webmanifest
    /images/hub/, /images/home/, /images/logo.png
  next.config.mjs             ← trailingSlash: true (подтверждено, стоит верно)
  package.json                ← включает sharp
  tailwind.config.ts          ← палитра "тёплый пергамент"
  .env                        ← НЕ в git. REVALIDATE_SECRET создан на сервере

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
                                  --ignore-existing). Протестирован на реальном
                                  сервере — 34 файла успешно доставлены
  update-article.sh            ← доставка правки уже опубликованной статьи
                                  (перезапись) + сброс её ISR-кеша.
                                  Протестирован на реальной правке
  reset-local-content.js       ← dev-утилита: локальный откат
                                  published/ → pending/ с удалением дат.
                                  Не часть штатного пайплайна, только
                                  для тестовых сценариев

/.github/workflows/
  deploy.yml                   ← GitHub Actions, автодеплой кода по git push.
                                  Настроен и подтверждён рабочим тестовым
                                  прогоном (см. «Готово»)

/docs/                         ← документация проекта
.gitignore                     ← контент исключён (content/pending, content/published,
                                  content/anchors.json, site/content/planned-urls.json)
                                  + node_modules, .env, .next
```

## Git и синхронизация с VPS
Git отслеживает только код (`site/`, `autopilot/`-скрипты, `scripts/`,
`docs/`, `content/semantic_clusters.json`, `.github/workflows/`). Файлы,
которые мутируют скрипты на сервере (`content/pending/`,
`content/published/`, `content/anchors.json`,
`site/content/planned-urls.json`), исключены из git и доставляются
отдельно через `rsync`. Подробности и обоснование —
`docs/ARCHITECTURE.md`, раздел «Три независимых канала синхронизации»;
пошаговая настройка — `docs/DEPLOYMENT.md`.

Три сценария синхронизации — **все три протестированы на реальном сервере**:
1. **Новые статьи** → `scripts/sync-content.sh` → `content/pending/` на
   сервере. Протестировано — 34 статьи доставлены успешно. Автопубликация
   настроена через cron (см. «Готово» ниже) — текущее число
   опубликованных/ожидающих статей меняется динамически, актуальное
   значение — `ls content/published/ | wc -l` и `ls content/pending/ |
   wc -l` на сервере, не в этом файле
2. **Правка уже опубликованной статьи** → `scripts/update-article.sh` —
   протестирован на реальной правке опубликованной статьи. При
   тестировании найден и исправлен баг с отсутствующим слэшем в URL
   `/api/revalidate` (из-за `trailingSlash: true` кеш тихо не
   сбрасывался). Исправление подтверждено повторным тестом
3. **Код** → `git push` → GitHub Actions → `git pull` на сервере
   (+ пересборка, если менялся `site/`/`autopilot/`). Настроено и
   **подтверждено рабочим тестовым деплоем** — замена домена-плейсхолдера
   прошла через весь цикл: коммит → push → Actions → pull → build →
   pm2 restart, без ошибок

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

**Сайт и код:**
- 13 типов блоков, Header/Footer, breadcrumbs, TOC, SEO/JSON-LD,
  прод-сборка проверена целиком. Структура страниц, включая главную —
  `docs/SITE.md`
- **Кеширование (ISR)**: статьи — `revalidate 86400`, sitemap —
  `revalidate 3600`, оба поверх `fs.readFile` (не статический импорт).
  Плюс точечный сброс кеша конкретного URL по требованию
  (`/api/revalidate`). Механизм — `docs/ARCHITECTURE.md`
- `sharp` установлен, логотип подключён (хедер — SVG-лабиринт, JSON-LD —
  `/images/logo.png`)
- **Домен-плейсхолдер `example.com` заменён на `chislavlasti.com` по
  всему коду** (canonical, og:*, twitter:*, все URL в JSON-LD) —
  проверено на живой опубликованной статье, ни одного упоминания
  `example.com` не осталось

**Инфраструктура (сервер поднят и работает):**
- Домен **chislavlasti.com** куплен (hoster.kz), DNS настроен и
  полностью обновился — A-записи для корня и `www` указывают на IP
  сервера, лишние/конфликтующие записи удалены
- VPS арендован, IP: `185.113.132.85`. Окружение установлено — Node.js,
  PM2, Nginx
- Код склонирован на сервер (`/var/www/numerology-site`), собран
  (`npm run build`), запущен через PM2 (процесс `site`, стабилен,
  без рестартов)
- **SSL настроен** — сертификат Let's Encrypt через certbot, домены
  `chislavlasti.com` + `www.chislavlasti.com`, автообновление настроено
  самим certbot, срок действия текущего сертификата — до 2026-10-14.
  HTTP автоматически редиректит на HTTPS (`301`)
- `.env` с `REVALIDATE_SECRET` создан на сервере
- **GitHub Actions (CI/CD) настроен и подтверждён рабочим деплоем** —
  три секрета (`VPS_HOST`, `VPS_USER`, `DEPLOY_SSH_KEY`) добавлены,
  отдельная SSH-пара ключей для CI создана и добавлена на сервер.
  Тестовый push прошёл весь цикл без ошибок
- **Индексация временно заблокирована на время тестов** — в Nginx
  (`/etc/nginx/sites-available/chislavlasti.com`, блок `location /`)
  добавлен `add_header X-Robots-Tag "noindex, nofollow";`. См.
  `docs/DEPLOYMENT.md`, раздел «Блокировка индексации на время
  тестирования» — **обязательно убрать перед реальным запуском**
- **Автопубликация настроена через cron** — тестовый режим: 1 статья
  каждые 2 часа (`0 */2 * * *`). Планируется переключить на 1 раз в
  день (`0 10 * * *`) перед реальным запуском — см. «Не сделано»
- **Бэкап контента настроен через cron** — еженедельно, воскресенье
  03:00 UTC, архив всей `content/` в `/backup/`. Проверен вручную,
  первый архив создан успешно. Ротация старых архивов не настроена
- **Логирование с ротацией настроено** — `autopilot.log` через
  системный `logrotate` (weekly, 4 копии), PM2-логи через
  `pm2-logrotate` (10MB/30 копий). При настройке обнаружена и
  исправлена проблема с правами на `/var/log/` — подробности и
  правильное решение (не трогать владельца, только `chmod 755`) — в
  `docs/DEPLOYMENT.md`, раздел «Логирование»
- **Изображения для главной страницы на месте** — hero-картинка и 6
  иконок присутствуют и отдаются сайтом (вопреки более ранней записи в
  этом файле, которая была неточной)
- **Все 9 хабов написаны** и включены в пул сгенерированного контента

**Автопилот и контент:**
- `publish.js`, `linkbuilder.js`, `update-planned-urls.js`,
  `build-anchors.js`, `validate-clusters.js` реализованы и проверены
  end-to-end — **как локально, так и на реальном продакшн-сервере**.
  Подробности — `docs/AUTOPILOT.md`
- Контентная система: `prompt_02_onpage.md`/`prompt_03_generator.md` +
  skill-файлы. `hub_id` и анкор хлебной крошки на хаб имеют явные
  правила в Промпте 2 — см. `docs/CONTENT.md`
- Формат JSON статьи и правила хранения — `docs/STORAGE.md`
- **Тестовый прогон публикации выполнен на реальном сайте**: из 34
  сгенерированных статей часть опубликована через cron и вручную,
  структура и вёрстка проверены на живых страницах, `linkbuilder.js`
  отработал корректно. `planned-urls.json` и `anchors.json`
  пересобираются штатно, `sitemap.xml` подхватывает новые URL с
  задержкой до часа (ожидаемое поведение ISR)
- **Локальная копия контента сброшена в чистое состояние** — все 34
  статьи снова в `content/pending/`, без дат публикации/изменения
  (`scripts/reset-local-content.js`). На сервере тестовые публикации
  пока остаются — полный сброс сервера входит в план следующего шага
  (см. «Не сделано», «План выхода в продакшн»)

## Не сделано / следующие шаги

**План выхода в продакшн (согласован, не выполнен):**
1. Дождаться, пока cron дособерёт оставшиеся тестовые статьи из
   текущей очереди на сервере
2. Полный сброс сервера — очистить `content/pending/` и
   `content/published/` на сервере, пересобрать пустой
   `planned-urls.json` (`node update-planned-urls.js`). Отличается от
   локального сброса (`reset-local-content.js`), который уже сделан —
   нужно то же самое, но на сервере
3. Написать ещё 10-15 статей (буфер на ~2 недели вперёд при темпе
   публикации 1/день)
4. Собрать пачку из ~30 статей и разом синхронизировать на сервер
   (`sync-content.sh`)
5. Опубликовать все 30 разом (`publish.js --count 30` +
   `linkbuilder.js`)
6. **Убрать `X-Robots-Tag: noindex` из Nginx** — открыть индексацию
7. **Переключить cron автопубликации** с тестового режима (каждые 2
   часа) на боевой — `0 10 * * *` (1 статья в день, время сервера UTC)

**Перед шагом 6 (снятие noindex) также проверить:**
- `site/app/robots.ts` — не остались ли там ручные `Disallow: /`,
  добавленные на время тестов помимо Nginx-заголовка

**Не реализовано:**
- `generate.js` (батч-генерация статей скриптом через Anthropic API) —
  генерация по-прежнему полностью ручная, через чат
- `validator.js` (автовалидация карточки между Промптом 2 и 3) — не
  написан, чек-лист применяется вручную
- `telegram.js` (уведомления о публикации) — не написан
- `storage.js` (общий интерфейс хранилища) — не написан, каждый скрипт
  работает с `fs` напрямую

**Прочее:**
- Существующие 34 статьи изначально сгенерированы **до** финальной
  правки правил Промпта 2 про `hub_id`/анкор хлебной крошки — часть из
  них может содержать `hub_id` с подчёркиванием вместо дефиса. Задним
  числом не исправлялись
- Зонирование `linkbuilder.js` по H3 вместо H2 + общий потолок ссылок —
  решение не принято, см. `docs/AUTOPILOT.md`
- Ротация старых бэкапов в `/backup/` не настроена — архивы копятся
  без автоудаления

## Правила
- Комментарии в коде на русском языке
- Вся документация — `/docs/`
- `hub_id` в статье — всегда через дефис; в `semantic_clusters.json` поле
  хранится через подчёркивание, конвертация — на этапе Промпта 2 (правило
  явно прописано, см. `docs/CONTENT.md`)
- Структура блоков — `/autopilot/prompts/skills/skill_07_html_components.md`
- Структура страниц — `/docs/SITE.md`
- **Домен `chislavlasti.com` используется везде** — плейсхолдер
  `example.com` полностью заменён в коде (см. «Готово»); если где-то
  всплывёт заново (например, в новом файле, скопированном по шаблону) —
  исправлять сразу
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
- **Индексация заблокирована на время тестов** (`X-Robots-Tag: noindex`
  в Nginx) — не забыть убрать перед реальным запуском, см.
  `docs/DEPLOYMENT.md`

## Разделение ответственности
- Claude Code — только пишет код и редактирует файлы
- Команды в терминале (install, run, build) — выполняет пользователь сам
- Claude Code не запускает никаких shell-команд