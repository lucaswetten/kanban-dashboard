const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_VERSION = '2022-06-28'

async function notionFetch(path, method = 'GET', body) {
  if (!NOTION_API_KEY) {
    const err = new Error('NOTION_API_KEY não configurada nas variáveis de ambiente do Vercel')
    err.status = 500
    throw err
  }

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message ?? `Notion error ${res.status}`)
    err.status = res.status
    err.notionError = data
    throw err
  }
  return data
}

function handleError(err, res) {
  const status = err.status ?? 500
  res.status(status).json({ error: err.message, details: err.notionError ?? null })
}

module.exports = { notionFetch, handleError }
