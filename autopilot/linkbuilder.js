const fs = require("fs");
const path = require("path");
const { buildAnchors } = require("./build-anchors");

const ROOT = path.join(__dirname, "..");
const ANCHORS_PATH = path.join(ROOT, "content/anchors.json");

const MD_LINK = /\[([^\]]+)\]\(((?:\/|http)[^)]+)\)/g;

function parseArgs(argv) {
  const args = { file: null, dir: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--file") {
      args.file = argv[++i];
    } else if (arg === "--dir") {
      args.dir = argv[++i];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }
  return args;
}

function isWordChar(ch) {
  return /[0-9A-Za-zА-Яа-яЁё]/.test(ch);
}

// Словарь анкоров: пересобирается из семантического ядра в content/anchors.json,
// затем читается оттуда — build-anchors.js добавляет падежные формы и синонимы
function buildAnchorDictionary() {
  buildAnchors();
  const anchors = JSON.parse(fs.readFileSync(ANCHORS_PATH, "utf-8"));
  return Object.entries(anchors).map(([anchor, url]) => ({ anchor, url }));
}

// URL уже использованные в статье — не предлагаются повторно
function collectOccupiedUrls(article) {
  const occupied = new Set();

  for (const block of article.blocks) {
    if (block.type !== "paragraph" || typeof block.text !== "string") continue;
    MD_LINK.lastIndex = 0;
    let match;
    while ((match = MD_LINK.exec(block.text)) !== null) {
      occupied.add(match[2]);
    }
  }

  if (article.internal_links && article.internal_links.up && article.internal_links.up.url) {
    occupied.add(article.internal_links.up.url);
  }

  for (const block of article.blocks) {
    if (block.type !== "links" || !Array.isArray(block.items)) continue;
    for (const item of block.items) {
      if (item.url) occupied.add(item.url);
    }
  }

  return occupied;
}

function hasMarkdownLink(text) {
  MD_LINK.lastIndex = 0;
  return MD_LINK.test(text);
}

// Зоны: intro (до первого h2), затем по одной зоне на h2 до следующего h2 или конца статьи
function buildZones(blocks) {
  const h2Indices = [];
  blocks.forEach((block, i) => {
    if (block.type === "h2") h2Indices.push(i);
  });

  if (h2Indices.length === 0) {
    return [{ label: "intro", start: 0, end: blocks.length }];
  }

  const zones = [];
  if (h2Indices[0] > 0) {
    zones.push({ label: "intro", start: 0, end: h2Indices[0] });
  }

  for (let i = 0; i < h2Indices.length; i++) {
    const start = h2Indices[i];
    const end = i + 1 < h2Indices.length ? h2Indices[i + 1] : blocks.length;
    const label = `H2 "${blocks[start].text}"`;
    zones.push({ label, start, end });
  }

  return zones;
}

function findFirstMatch(text, anchorLower, protectedRanges) {
  const lowerText = text.toLowerCase();
  let searchFrom = 0;

  while (true) {
    const idx = lowerText.indexOf(anchorLower, searchFrom);
    if (idx === -1) return null;
    const end = idx + anchorLower.length;

    const overlapsProtected = protectedRanges.some(([s, e]) => idx < e && end > s);
    const beforeChar = idx > 0 ? text[idx - 1] : "";
    const afterChar = end < text.length ? text[end] : "";
    const boundaryOk = !isWordChar(beforeChar) && !isWordChar(afterChar);

    if (!overlapsProtected && boundaryOk) {
      return { start: idx, end };
    }
    searchFrom = idx + 1;
  }
}

function processZone(zone, blocks, sortedAnchors, occupiedUrls) {
  const paragraphIndices = [];
  for (let i = zone.start; i < zone.end; i++) {
    if (blocks[i].type === "paragraph" && typeof blocks[i].text === "string") {
      paragraphIndices.push(i);
    }
  }

  if (paragraphIndices.some((i) => hasMarkdownLink(blocks[i].text))) {
    return { skipped: true, additions: [] };
  }

  const protectedRangesByBlock = new Map(paragraphIndices.map((i) => [i, []]));
  const additions = [];

  for (const entry of sortedAnchors) {
    if (additions.length >= 2) break;
    if (occupiedUrls.has(entry.url)) continue;

    const anchorLower = entry.anchor.toLowerCase();
    let found = null;

    for (const blockIndex of paragraphIndices) {
      const text = blocks[blockIndex].text;
      const match = findFirstMatch(text, anchorLower, protectedRangesByBlock.get(blockIndex));
      if (match) {
        found = { blockIndex, ...match };
        break;
      }
    }

    if (!found) continue;

    const { blockIndex, start, end } = found;
    const text = blocks[blockIndex].text;
    const phrase = text.slice(start, end);
    const replacement = `[${phrase}](${entry.url})`;
    blocks[blockIndex].text = text.slice(0, start) + replacement + text.slice(end);

    const ranges = protectedRangesByBlock.get(blockIndex);
    ranges.push([start, start + replacement.length]);
    // Сдвигаем ранее сохранённые диапазоны в этом блоке, если вставка была раньше них
    const shift = replacement.length - (end - start);
    protectedRangesByBlock.set(
      blockIndex,
      ranges.map(([s, e]) => (s > start ? [s + shift, e + shift] : [s, e]))
    );

    occupiedUrls.add(entry.url);
    additions.push({ url: entry.url, anchor: entry.anchor });
  }

  return { skipped: false, additions };
}

function processArticle(filePath, anchorDictionary) {
  const article = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const sortedAnchors = anchorDictionary
    .filter((entry) => entry.url !== article.url)
    .map((entry, i) => ({ ...entry, i }))
    .sort((a, b) => b.anchor.length - a.anchor.length || a.i - b.i);

  const occupiedUrls = collectOccupiedUrls(article);

  // [debug] временная диагностика — размер словаря анкоров до/после вычета занятых URL
  const totalCount = anchorDictionary.length;
  const occupiedCount = occupiedUrls.size;
  const availableCount = sortedAnchors.filter((entry) => !occupiedUrls.has(entry.url)).length;
  const debugLine = `[debug] ${path.basename(filePath)}: доступно анкоров в словаре — ${availableCount} (всего в anchors.json: ${totalCount}, занято URL: ${occupiedCount})`;

  const zones = buildZones(article.blocks);

  const report = [];
  for (const zone of zones) {
    const result = processZone(zone, article.blocks, sortedAnchors, occupiedUrls);

    if (result.skipped) {
      report.push(`  ${zone.label} → без изменений (ссылка уже есть)`);
    } else if (result.additions.length === 0) {
      report.push(`  ${zone.label} → совпадений не найдено`);
    } else {
      for (const addition of result.additions) {
        report.push(`  ${zone.label} → добавлена ссылка на ${addition.url} ("${addition.anchor}")`);
      }
    }
  }

  return { article, report, debugLine };
}

function outputPathFor(filePath, dryRun) {
  if (!dryRun) return filePath;
  return filePath.replace(/\.json$/, ".linkbuilder-preview.json");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file && !args.dir) {
    console.error("Использование:");
    console.error("  node autopilot/linkbuilder.js --file content/pending/chislo-sudby-7.json");
    console.error("  node autopilot/linkbuilder.js --dir content/published/ [--dry-run]");
    process.exit(1);
  }

  const anchorDictionary = buildAnchorDictionary();

  let files;
  if (args.file) {
    files = [path.resolve(process.cwd(), args.file)];
  } else {
    const dirPath = path.resolve(process.cwd(), args.dir);
    files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json") && !f.endsWith(".linkbuilder-preview.json"))
      .filter((f) => fs.statSync(path.join(dirPath, f)).isFile())
      .sort()
      .map((f) => path.join(dirPath, f));
  }

  for (const filePath of files) {
    const { article, report, debugLine } = processArticle(filePath, anchorDictionary);

    const outPath = outputPathFor(filePath, args.dryRun);
    fs.writeFileSync(outPath, JSON.stringify(article, null, 2) + "\n", "utf-8");

    console.log(debugLine);
    console.log(`${path.basename(filePath)}:`);
    console.log(report.join("\n"));
  }
}

main();
