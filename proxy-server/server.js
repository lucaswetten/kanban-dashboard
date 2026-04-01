import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT ?? 3001
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_VERSION = '2022-06-28'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(express.json())
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', notion: !!NOTION_API_KEY })
})

async function notionFetch(path, method = 'GET', body) {
  if (!NOTION_API_KEY) {
    throw Object.assign(new Error('NOTION_API_KEY not set in proxy-server/.env'), { status: 500 })
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

// Query a database
app.post('/api/notion/databases/:id/query', async (req, res, next) => {
  try {
    const data = await notionFetch(`/databases/${req.params.id}/query`, 'POST', req.body)
    res.json(data)
  } catch (err) { next(err) }
})

// Get database schema
app.get('/api/notion/databases/:id', async (req, res, next) => {
  try {
    const data = await notionFetch(`/databases/${req.params.id}`)
    res.json(data)
  } catch (err) { next(err) }
})

// Get a page
app.get('/api/notion/pages/:id', async (req, res, next) => {
  try {
    const data = await notionFetch(`/pages/${req.params.id}`)
    res.json(data)
  } catch (err) { next(err) }
})

// Create a page
app.post('/api/notion/pages', async (req, res, next) => {
  try {
    const data = await notionFetch('/pages', 'POST', req.body)
    res.json(data)
  } catch (err) { next(err) }
})

// Update a page
app.patch('/api/notion/pages/:id', async (req, res, next) => {
  try {
    const data = await notionFetch(`/pages/${req.params.id}`, 'PATCH', req.body)
    res.json(data)
  } catch (err) { next(err) }
})

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status ?? 500
  res.status(status).json({ error: err.message, details: err.notionError ?? null })
})

app.listen(PORT, () => {
  console.log(`Notion proxy running on http://localhost:${PORT}`)
  if (!NOTION_API_KEY) {
    console.warn('⚠️  NOTION_API_KEY not set — add it to proxy-server/.env')
  }
})
