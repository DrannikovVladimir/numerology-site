/**
 * convert-clusters.js
 * Конвертирует semantic_clusters.md в semantic_clusters.json
 * 
 * Запуск: node convert-clusters.js
 * Входной файл:  semantic_clusters.md
 * Выходной файл: semantic_clusters.json
 */

const fs = require('fs')
const path = require('path')

const INPUT_FILE = 'semantic_clusters.md'
const OUTPUT_FILE = 'semantic_clusters.json'

// Читаем файл
const content = fs.readFileSync(INPUT_FILE, 'utf-8')
const lines = content.split('\n')

// Парсим сводную таблицу
function parseTable(lines) {
  const clusters = []
  let inTable = false

  for (const line of lines) {
    // Начало таблицы
    if (line.includes('| # | Название кластера |')) {
      inTable = true
      continue
    }

    // Разделитель таблицы
    if (inTable && line.startsWith('|---')) {
      continue
    }

    // Конец таблицы
    if (inTable && !line.startsWith('|')) {
      inTable = false
      continue
    }

    if (!inTable) continue

    // Парсим строку таблицы
    const cols = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length < 7) continue

    const id = parseInt(cols[0])
    if (isNaN(id)) continue

    const title = cols[1]
    const contentType = cols[2]  // info / calc / info + calc
    const architectureRaw = cols[3]
    const url = cols[4]
    const primaryKeyword = cols[5]
    const frequencyRaw = cols[6].replace(/\s/g, '').replace('—', '0')
    const frequency = parseInt(frequencyRaw.replace(/\s/g, '')) || 0

    // Определяем тип страницы
    let pageType = 'standalone'
    let hubId = null

    if (architectureRaw === 'hub') {
      pageType = 'hub'
    } else if (architectureRaw.startsWith('spoke →')) {
      pageType = 'spoke'
      // Извлекаем hub URL из "spoke → /hub-url/"
      const match = architectureRaw.match(/spoke → (.+)/)
      if (match) {
        hubId = match[1].trim().replace(/\//g, '').replace(/-/g, '_')
      }
    }

    // Определяем шаблон для spoke
    let template = null
    if (pageType === 'spoke') {
      if (url.startsWith('/chislo-sudby/')) template = 'chislo-sudby-1-9'
      else if (url.startsWith('/numerologiya-na-chasakh/')) template = 'chasy-00-23'
      else if (url.startsWith('/angelskie-chisla/')) template = 'angelskie-chisla'
      else if (url.startsWith('/numerologiya-mesyaca/')) template = 'mesyacy'
      else if (url.startsWith('/sovmestimost/')) template = 'sovmestimost'
    }

    // Формируем page_id из URL
    const pageId = url.replace(/\//g, '_').replace(/^_|_$/g, '').replace(/-/g, '_')

    clusters.push({
      id,
      page_id: pageId,
      title,
      content_type: contentType,
      page_type: pageType,
      hub_id: hubId,
      url,
      primary_keyword: primaryKeyword,
      frequency,
      template,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  return clusters
}

// Парсим ключевые слова из детализации кластеров
function parseKeywords(lines) {
  const keywords = {}
  let currentId = null

  for (const line of lines) {
    // Заголовок кластера: ### Кластер N — Название
    const clusterMatch = line.match(/^### Кластер (\d+)/)
    if (clusterMatch) {
      currentId = parseInt(clusterMatch[1])
      keywords[currentId] = []
      continue
    }

    // Строка с ключевым словом: - запрос (частотность)
    if (currentId && line.match(/^- .+\(\d+\)/)) {
      const kwMatch = line.match(/^- (.+) \([\d\s]+\)/)
      if (kwMatch) {
        keywords[currentId].push(kwMatch[1].trim())
      }
      continue
    }

    // Конец детализации кластера
    if (currentId && line.startsWith('---')) {
      currentId = null
    }
  }

  return keywords
}

// Основная логика
const clusters = parseTable(lines)
const keywords = parseKeywords(lines)

// Добавляем ключевые слова к кластерам
clusters.forEach(cluster => {
  cluster.cluster_keywords = keywords[cluster.id] || []
})

// Сохраняем JSON
const output = {
  meta: {
    total: clusters.length,
    generated_at: new Date().toISOString(),
    source: INPUT_FILE
  },
  clusters
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8')

// Отчёт
const byType = clusters.reduce((acc, c) => {
  acc[c.page_type] = (acc[c.page_type] || 0) + 1
  return acc
}, {})

console.log(`✓ Конвертация завершена`)
console.log(`  Всего кластеров: ${clusters.length}`)
console.log(`  Hub:             ${byType.hub || 0}`)
console.log(`  Standalone:      ${byType.standalone || 0}`)
console.log(`  Spoke:           ${byType.spoke || 0}`)
console.log(`  Файл:            ${OUTPUT_FILE}`)
