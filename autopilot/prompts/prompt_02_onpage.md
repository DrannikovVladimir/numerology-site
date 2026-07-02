# Промпт 2 — On-page карточка кластера

## Перед началом работы прочитай

Всегда:
- skills/skill_01_seo_role.md — роль и контекст проекта
- skills/skill_02_tov_numerology.md — тон голоса
- skills/skill_03_content_rules.md — правила контента
- skills/skill_07_html_components.md — библиотека блоков

Если hub или standalone:
- skills/hub/skill_04_structure_hub.md — если page_type = hub
- skills/hub/skill_04b_structure_standalone.md — если page_type = standalone

Если spoke:
- skills/spoke/skill_05_base.md — базовые правила для всех spoke
- skills/spoke/skill_05_{template}.md — файл серии по полю template кластера

Таблица соответствия template → файл серии:
| template | файл |
|---|---|
| chislo-sudby-1-9 | skill_05_chislo-sudby-1-9.md |
| chislo-sudby-mastery | skill_05_chislo-sudby-mastery.md |
| sovmestimost | skill_05_sovmestimost.md |
| chasy-00-23 | skill_05_chasy-00-23.md |
| angelskie-chisla | skill_05_angelskie-chisla.md |
| mesyacy | skill_05_mesyacy.md |

---

## Работа с файлом кластеризации

В Knowledge Base проекта есть файл semantic_clusters.json
с полной кластеризацией сайта.

Когда пользователь называет кластер (по номеру или названию):
1. Найди его в semantic_clusters.json
2. Возьми оттуда: page_type, url, primary_keyword, template, hub_id
3. Если spoke — найди hub_id и 2-3 соседних spoke с тем же hub_id
4. Сформируй карточку автоматически

## Входной формат

Пользователь подаёт только:

КЛАСТЕР: [номер или название]

Больше ничего не нужно — все данные берёшь из semantic_clusters.json.
Как только получишь номер или название — сразу генерируй карточку.
Ничего не жди, не переспрашивай.

## Твоя задача

Получив данные одного кластера — сформировать полную on-page карточку страницы.
Карточка используется двумя способами:
1. Тобой — как ТЗ для написания hub-статьи вручную
2. Агентом — как инструкция для автоматической генерации spoke

---

## Что выдать

### РАЗДЕЛ 1 — МЕТА-ДАННЫЕ

Правила — в skill_05_base.md (для spoke) или skill_04 (для hub/standalone).

**Title:**
- Главный запрос + выгода или интрига
- Без воды, без "лучший", "топ", "№1"
- Проверь длину по правилам скила

**Description:**
- Раскрывает что найдёт пользователь
- Содержит главный запрос
- Лёгкий призыв к действию в конце
- Проверь длину по правилам скила

**H1:**
- Близко к главному запросу но живее
- Не копирует Title дословно
- Содержит главный запрос

---

### РАЗДЕЛ 2 — СТРУКТУРА КОНТЕНТА

Выдай структуру H2 страницы с кратким описанием каждого раздела.

Для hub и standalone — структуру строишь сам по вопросам из skill_04.
Для spoke — используй обязательные и вариативные H2 из файла серии.

Формат:
```
[Вводный абзац]
Описание: [суть крючка — одно предложение]

H2: [заголовок]
Lead: [о чём lead-абзац — одно предложение]

H2: [заголовок]
Lead: [о чём lead-абзац — одно предложение]
```

H3 не расписывай — агент определяет их сам при написании статьи.

---

### РАЗДЕЛ 3 — СЕМАНТИКА

**LSI-ключи:**
- Hub: 15-20
- Standalone: 8-12
- Spoke: 6-10
- Берутся из запросов кластера или синонимов главного запроса
- Не повторяют главный запрос дословно

**FAQ-блок:**
- Hub: 3-5 вопросов
- Spoke/standalone: 2-3 вопроса
- Вопросы из реальной семантики кластера, переформулированные в живой язык
- Ответы: 2-4 предложения, конкретно, без арифметики

---

### РАЗДЕЛ 4 — ПЕРЕЛИНКОВКА

**Для hub:**
- Ссылки вниз на все spoke (из semantic_clusters.json по hub_id)
- Ссылки горизонтально на 2-3 соседних hub

**Для spoke:**
- Ссылка вверх на родительский hub (из hub_id)
- Ссылки горизонтально на 2-3 соседних spoke того же hub
- Ссылки вниз на 1-2 тематически связанных hub

**Для standalone:**
- Ссылка вверх на ближайший hub
- Горизонтально: не более 3 ссылок

---

### РАЗДЕЛ 5 — CTA-БЛОКИ

Сгенерируй реальные тексты для трёх CTA под тему этой конкретной статьи.

**CTA 1 — после введения (бот):**
```json
{
  "type": "cta", "position": "after_intro",
  "heading": "...",
  "subtext": "...",
  "button_text": "... →",
  "url": "https://t.me/numerolog_master_bot"
}
```

**CTA 2 — середина статьи (канал):**
```json
{
  "type": "cta", "position": "mid_article_channel",
  "heading": "...",
  "subtext": "...",
  "button_text": "Перейти в канал →",
  "url": "https://t.me/chisla_vlasti"
}
```

**CTA 3 — конец статьи (бот, другая формулировка):**
```json
{
  "type": "cta", "position": "end_of_article",
  "heading": "...",
  "subtext": "...",
  "button_text": "... →",
  "url": "https://t.me/numerolog_master_bot"
}
```

Правила:
- heading CTA 1 и CTA 3 — разные формулировки, оба про расчёт в боте
- heading CTA 2 — про контент канала, не про расчёт
- Все тексты релевантны теме конкретной статьи

---

### РАЗДЕЛ 6 — JSON ДЛЯ АГЕНТА

Выдай карточку в JSON.
Поле `blocks` содержит только H2 с lead-описаниями, CTA с текстами,
уникальные блоки серии и финальные блоки (faq, links, cta).
H3 и paragraph в карточку не включай — агент напишет их сам.

Правила заполнения:
- page_id — транслит URL без слешей, дефисы → подчёркивания
- hub_id — null если страница сама является hub
- template — значение из semantic_clusters.json (не придумывать)
- word_count_target — 2500 для hub, 2000 для standalone, 1200 для spoke
- internal_links.up — null для hub
- faq — реальные вопросы и ответы из Раздела 3
- Все URL из semantic_clusters.json

**Уникальные блоки серии:**
Если у серии есть уникальные блоки (см. файл серии) — включи их в blocks
на правильных позициях с реальным заполнением под конкретный кластер.
Не копируй значения из примера в скиле — заполняй под тему статьи.

```json
{
  "page_id": "...",
  "page_type": "hub | spoke | standalone",
  "hub_id": "... или null",
  "nav_title": "2-4 слова",
  "url": "/url/",
  "primary_keyword": "...",
  "cluster_keywords": ["..."],
  "meta": {
    "title": "...",
    "description": "...",
    "h1": "..."
  },
  "template": "... или null",
  "blocks": [
    {
      "type": "paragraph",
      "text": "описание вводного абзаца — суть крючка"
    },
    {
      "type": "cta",
      "position": "after_intro",
      "heading": "...",
      "subtext": "...",
      "button_text": "... →",
      "url": "https://t.me/numerolog_master_bot"
    },
    {
      "type": "h2",
      "text": "заголовок H2",
      "lead": "описание lead-абзаца — о чём этот раздел"
    },
    {
      "type": "cta",
      "position": "mid_article_channel",
      "heading": "...",
      "subtext": "...",
      "button_text": "Перейти в канал →",
      "url": "https://t.me/chisla_vlasti"
    },
    {
      "type": "faq",
      "items": [
        {"question": "...", "answer": "..."}
      ]
    },
    {
      "type": "links",
      "title": "По теме",
      "items": [
        {"url": "/...", "anchor": "...", "description": "..."}
      ]
    },
    {
      "type": "cta",
      "position": "end_of_article",
      "heading": "...",
      "subtext": "...",
      "button_text": "... →",
      "url": "https://t.me/numerolog_master_bot"
    }
  ],
  "lsi_keywords": ["..."],
  "faq": [
    {"question": "...", "answer": "..."}
  ],
  "internal_links": {
    "up": {"url": "/...", "anchor": "..."},
    "horizontal": [{"url": "/...", "anchor": "..."}],
    "down": [{"url": "/...", "anchor": "..."}]
  },
  "tov": "мистический экспертный",
  "word_count_target": 1200,
  "status": "pending"
}
```

---

## Формат финального вывода

Выдавай строго в таком порядке:

---
# Карточка страницы: [название кластера]

## 1. Мета-данные
[title, description, h1]

## 2. Структура контента
[H2 с описаниями]

## 3. Семантика
[LSI-ключи и FAQ]

## 4. Перелинковка
[все ссылки]

## 5. CTA-блоки
[три CTA с текстами]

## 6. JSON
[json блок]

---

После JSON выведи одну строку проверки:
✓ Карточка готова | Тип: [hub/spoke/standalone] | Шаблон: [template или null] | Объём: [word_count_target] слов | URL: [/url/]