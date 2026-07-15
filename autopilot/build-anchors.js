const fs = require("fs");
const path = require("path");
const RussianNouns = require("russian-nouns-js");

const ROOT = path.join(__dirname, "..");
const CLUSTERS_PATH = path.join(ROOT, "content/semantic_clusters.json");
const PLANNED_URLS_PATH = path.join(ROOT, "site/content/planned-urls.json");
const ANCHORS_PATH = path.join(ROOT, "content/anchors.json");

const NUMBER_SYNONYMS = {
  1: "единица", 2: "двойка", 3: "тройка", 4: "четвёрка",
  5: "пятёрка", 6: "шестёрка", 7: "семёрка", 8: "восьмёрка", 9: "девятка",
};

const Gender = RussianNouns.Gender;
const engine = new RussianNouns.Engine();

function declineForms(text, gender) {
  const lemma = RussianNouns.createLemma({ text, gender });
  const forms = new Set();
  for (const grammaticalCase of RussianNouns.CASES) {
    for (const form of engine.decline(lemma, grammaticalCase)) {
      forms.add(form);
    }
  }
  return Array.from(forms);
}

// Шаблоны chislo-sudby-1-9 и chislo-sudby-mastery имеют url вида /chislo-sudby/N/
function extractDigit(url) {
  const match = url.match(/^\/chislo-sudby\/(\d+)\/$/);
  return match ? match[1] : null;
}

function buildAnchors() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_PATH, "utf-8")).clusters;
  const plannedUrls = JSON.parse(fs.readFileSync(PLANNED_URLS_PATH, "utf-8"));

  const anchors = {};

  for (const cluster of clusters) {
    if (plannedUrls[cluster.url] !== true) continue;

    if (cluster.template === "chislo-sudby-1-9" || cluster.template === "chislo-sudby-mastery") {
      const digit = extractDigit(cluster.url);
      if (!digit) continue;

      const tail = `судьбы ${digit}`;
      for (const form of declineForms("число", Gender.NEUTER)) {
        anchors[`${form} ${tail}`] = cluster.url;
      }

      if (cluster.template === "chislo-sudby-1-9") {
        const synonym = NUMBER_SYNONYMS[digit];
        if (synonym) {
          for (const form of declineForms(synonym, Gender.FEMININE)) {
            anchors[form] = cluster.url;
          }
        }
      }
    } else {
      anchors[cluster.primary_keyword] = cluster.url;
    }
  }

  fs.writeFileSync(ANCHORS_PATH, JSON.stringify(anchors, null, 2) + "\n", "utf-8");
  return anchors;
}

if (require.main === module) {
  const anchors = buildAnchors();
  console.log(`Записано ${Object.keys(anchors).length} анкоров в ${path.relative(ROOT, ANCHORS_PATH)}`);
}

module.exports = { buildAnchors };
