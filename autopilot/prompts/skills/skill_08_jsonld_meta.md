# skill_08_jsonld_meta.md

## Назначение

Эта схема НЕ генерируется LLM в Промпте 3.
Она собирается постобработкой из уже существующих полей финального JSON статьи —
без дублирования контента и без риска расхождения разметки с видимым текстом.

Источники данных:
- `url`, `meta.title`, `meta.description`, `meta.h1` — Article/WebPage
- `internal_links.up` — BreadcrumbList
- `faq` — FAQPage
- `page_type` — определяет глубину breadcrumb

---

## Важно: статус FAQPage в 2026

С 7 мая 2026 Google убрал rich-сниппет FAQPage из выдачи для всех сайтов
(ранее — с августа 2023 — фича была ограничена гос- и медсайтами).
FAQPage остаётся валидным типом schema.org и продолжает парситься
для понимания страницы поисковыми и AI-системами (AI Overviews, Perplexity,
Copilot grounding) — но больше не даёт визуального сниппета в Google Search.

Правило: оставлять FAQPage только если вопросы/ответы реально видны на странице
и совпадают с тем, что в `faq`. Не добавлять ради сниппета — сниппета не будет.

---

## Hub-страница

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://example.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "{{meta.h1}}",
          "item": "https://example.com{{url}}"
        }
      ]
    },
    {
      "@type": "Article",
      "@id": "https://example.com{{url}}#article",
      "headline": "{{meta.h1}}",
      "description": "{{meta.description}}",
      "url": "https://example.com{{url}}",
      "inLanguage": "ru",
      "datePublished": "{{date_published}}",
      "dateModified": "{{date_modified}}",
      "author": {
        "@type": "Organization",
        "name": "{{site_name}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "{{site_name}}",
        "logo": {
          "@type": "ImageObject",
          "url": "https://example.com/logo.png"
        }
      },
      "mainEntityOfPage": "https://example.com{{url}}"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "{{faq[0].question}}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{{faq[0].answer}}"
          }
        }
        // ... остальные faq[] из JSON статьи, без изменений текста
      ]
    }
  ]
}
```

Особенности hub:
- breadcrumb всегда 2 уровня: Главная → текущий hub (у hub нет `internal_links.up`)
- Article без `isPartOf` — hub самостоятелен в иерархии

---

## Spoke-страница

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://example.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "{{internal_links.up.anchor}}",
          "item": "https://example.com{{internal_links.up.url}}"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "{{meta.h1}}",
          "item": "https://example.com{{url}}"
        }
      ]
    },
    {
      "@type": "Article",
      "@id": "https://example.com{{url}}#article",
      "headline": "{{meta.h1}}",
      "description": "{{meta.description}}",
      "url": "https://example.com{{url}}",
      "inLanguage": "ru",
      "datePublished": "{{date_published}}",
      "dateModified": "{{date_modified}}",
      "isPartOf": {
        "@type": "WebPage",
        "@id": "https://example.com{{internal_links.up.url}}"
      },
      "author": {
        "@type": "Organization",
        "name": "{{site_name}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "{{site_name}}",
        "logo": {
          "@type": "ImageObject",
          "url": "https://example.com/logo.png"
        }
      },
      "mainEntityOfPage": "https://example.com{{url}}"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "{{faq[0].question}}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{{faq[0].answer}}"
          }
        }
        // ... остальные faq[] из JSON статьи
      ]
    }
  ]
}
```

Особенности spoke:
- breadcrumb 3 уровня: Главная → hub (`internal_links.up`) → текущий spoke
- Article содержит `isPartOf` со ссылкой на родительский hub

Если `faq` в JSON пуст или содержит < 2 вопросов — блок FAQPage не добавлять
(пустой/тонкий FAQ не должен размечаться).

---

## Standalone-страница

Идентично hub, но breadcrumb может иметь 3 уровня если есть тематическая привязка
к ближайшему hub через `internal_links.horizontal[0]` — иначе 2 уровня как у hub.

---

## Site-wide (один раз, не на каждую страницу)

Размещается в шаблоне сайта, не генерируется через Промпт 3.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{site_name}}",
  "url": "https://example.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{site_name}}",
  "url": "https://example.com/",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://t.me/chisla_vlasti"
  ]
}
```

---

## Что сознательно не используется

| Тип | Почему нет |
|---|---|
| HowTo | Деприоритезирован Google ещё в 2023 (десктоп), мёртв; к тому же у нас запрещены пошаговые расчёты в тексте — нечестно маппить туда "принцип словами" |
| Product / Review / AggregateRating | Не релевантно теме, нет товара/рейтинга для разметки |
| Recipe / Event / Course | Не относится к контенту сайта |
| QAPage | Это для форумов с множественными пользовательскими ответами — у нас один официальный ответ редакции, это FAQPage, не QAPage |

---

## Чек-лист перед публикацией разметки

☑ BreadcrumbList — есть на каждой странице, глубина соответствует page_type
☑ Article — headline и description совпадают с meta.h1 / meta.description дословно
☑ FAQPage — добавлена только если faq[] ≥ 2 вопросов и видна на странице как текст
☑ Текст question/answer в разметке идентичен видимому тексту страницы (без перефразирования)
☑ isPartOf у spoke ведёт на реальный существующий hub из internal_links.up
☑ WebSite/Organization — размещены один раз в шаблоне, не дублируются на каждой странице
☑ Все @id и url используют полный домен, не относительные пути
