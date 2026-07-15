#!/usr/bin/env node
/**
 * validate-clusters.js — проверка content/semantic_clusters.json перед коммитом.
 *
 * Ловит класс ошибок, который уже случался на практике: опечатка в url
 * (подчёркивание вместо дефиса) делает готовую статью «невидимой» для
 * update-planned-urls.js без явной ошибки где-либо в пайплайне — файл
 * существует, но никогда не находится.
 *
 * Использование:
 *   node autopilot/validate-clusters.js
 *
 * Код возврата: 0 — всё чисто, 1 — найдены ошибки (удобно для CI).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CLUSTERS_PATH = path.join(ROOT, "content/semantic_clusters.json");

// Поля, обязательные для ЛЮБОГО типа страницы
const REQUIRED_FIELDS_ALL = [
  "id",
  "page_id",
  "title",
  "page_type",
  "url",
  "primary_keyword",
  "status",
];

// hub_id и template имеют смысл только для spoke: у hub-страницы нет
// родителя (она сама хаб), у hub/standalone структура гибкая, не по
// жёсткому template (см. docs/CONTENT.md)
const REQUIRED_FIELDS_SPOKE_ONLY = ["hub_id", "template"];

const VALID_PAGE_TYPES = ["hub", "spoke", "standalone"];

function main() {
  if (!fs.existsSync(CLUSTERS_PATH)) {
    console.error(`Ошибка: не найден ${CLUSTERS_PATH}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(CLUSTERS_PATH, "utf-8"));
  } catch (err) {
    console.error(`Ошибка: ${CLUSTERS_PATH} не является валидным JSON — ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data.clusters)) {
    console.error('Ошибка: верхний уровень должен содержать поле "clusters" (массив)');
    process.exit(1);
  }

  const clusters = data.clusters;
  const errors = [];
  const warnings = [];

  const seenIds = new Map(); // id -> [индексы]
  const seenUrls = new Map(); // url -> [индексы]
  const seenPageIds = new Map(); // page_id -> [индексы]

  clusters.forEach((cluster, index) => {
    const loc = `clusters[${index}]` + (cluster.id !== undefined ? ` (id: ${cluster.id})` : "");

    // 1. Обязательные поля — общие для всех типов
    for (const field of REQUIRED_FIELDS_ALL) {
      if (cluster[field] === undefined || cluster[field] === null || cluster[field] === "") {
        errors.push(`${loc}: отсутствует обязательное поле "${field}"`);
      }
    }

    // 1b. hub_id/template — обязательны только для spoke
    if (cluster.page_type === "spoke") {
      for (const field of REQUIRED_FIELDS_SPOKE_ONLY) {
        if (cluster[field] === undefined || cluster[field] === null || cluster[field] === "") {
          errors.push(`${loc}: отсутствует обязательное поле "${field}" (обязательно для spoke)`);
        }
      }
    }

    if (cluster.url === undefined) {
      return; // остальные url-проверки без url бессмысленны
    }

    // 2. url: дефис vs подчёркивание
    // Ищем подчёркивание в url там, где по соседним частям похоже, что
    // это разделитель сегментов (например "5_i_5" вместо "5-i-5").
    if (typeof cluster.url === "string" && cluster.url.includes("_")) {
      errors.push(
        `${loc}: url содержит подчёркивание — "${cluster.url}". ` +
          `Ожидается дефис (например "5-i-5", не "5_i_5"). ` +
          `Подчёркивание в url делает файл статьи невидимым для update-planned-urls.js.`
      );
    }

    // 3. url должен начинаться и заканчиваться на "/"
    if (typeof cluster.url === "string") {
      if (!cluster.url.startsWith("/") || !cluster.url.endsWith("/")) {
        warnings.push(`${loc}: url "${cluster.url}" должен начинаться и заканчиваться на "/"`);
      }
    }

    // 4. page_type — допустимые значения
    if (cluster.page_type && !VALID_PAGE_TYPES.includes(cluster.page_type)) {
      errors.push(
        `${loc}: page_type "${cluster.page_type}" не входит в допустимые (${VALID_PAGE_TYPES.join(", ")})`
      );
    }

    // 5. hub_id — предупреждение про дефис (не жёсткая ошибка: сам реестр
    // исторически хранит hub_id через подчёркивание, конвертация — на
    // этапе генерации статьи, не здесь; но фиксируем как замечание)
    if (typeof cluster.hub_id === "string" && cluster.hub_id.includes("_") && cluster.page_type !== "hub") {
      warnings.push(
        `${loc}: hub_id "${cluster.hub_id}" содержит подчёркивание — при генерации статьи ` +
          `должен конвертироваться в дефис (см. правило в docs/CLAUDE.md)`
      );
    }

    // Сбор для проверки дублей
    if (cluster.id !== undefined) {
      const arr = seenIds.get(cluster.id) || [];
      arr.push(index);
      seenIds.set(cluster.id, arr);
    }
    if (cluster.url !== undefined) {
      const arr = seenUrls.get(cluster.url) || [];
      arr.push(index);
      seenUrls.set(cluster.url, arr);
    }
    if (cluster.page_id !== undefined) {
      const arr = seenPageIds.get(cluster.page_id) || [];
      arr.push(index);
      seenPageIds.set(cluster.page_id, arr);
    }
  });

  // 6. Дубли id
  for (const [id, indices] of seenIds.entries()) {
    if (indices.length > 1) {
      errors.push(`Дубль id "${id}" встречается в clusters[${indices.join(", ")}]`);
    }
  }

  // 7. Дубли url
  for (const [url, indices] of seenUrls.entries()) {
    if (indices.length > 1) {
      errors.push(`Дубль url "${url}" встречается в clusters[${indices.join(", ")}]`);
    }
  }

  // 8. Дубли page_id
  for (const [pageId, indices] of seenPageIds.entries()) {
    if (indices.length > 1) {
      errors.push(`Дубль page_id "${pageId}" встречается в clusters[${indices.join(", ")}]`);
    }
  }

  // 9. meta.total сверка с реальным количеством (предупреждение, не ошибка)
  if (data.meta && typeof data.meta.total === "number" && data.meta.total !== clusters.length) {
    warnings.push(
      `meta.total (${data.meta.total}) не совпадает с реальным количеством кластеров (${clusters.length})`
    );
  }

  // --- отчёт ---
  console.log(`Проверено кластеров: ${clusters.length}`);
  console.log("");

  if (warnings.length > 0) {
    console.log(`⚠️  Предупреждений: ${warnings.length}`);
    warnings.forEach((w) => console.log(`  - ${w}`));
    console.log("");
  }

  if (errors.length > 0) {
    console.log(`✗ Ошибок: ${errors.length}`);
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log("");
    console.log("Проверка не пройдена.");
    process.exit(1);
  }

  console.log("✓ Ошибок не найдено.");
  process.exit(0);
}

main();