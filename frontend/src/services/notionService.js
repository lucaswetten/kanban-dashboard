import { useNotionStore } from '../store/notionStore'

const BASE = '/api/notion'

async function notionRequest(path, method = 'GET', body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Request failed: ${res.status}`)
  }

  return res.json()
}

export async function fetchPages(databaseId) {
  const store = useNotionStore.getState()
  store.setLoading(true)

  try {
    const data = await notionRequest(`/databases/${databaseId}/query`, 'POST', {
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    })
    const pages = data.results ?? []
    useNotionStore.getState().setPages(pages)
    useNotionStore.getState().setLoading(false)
    return pages
  } catch (err) {
    useNotionStore.getState().setError(err.message)
    throw err
  }
}

export async function createPage(databaseId, { title, description }) {
  return notionRequest('/pages', 'POST', {
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: title } }] },
    },
    children: description
      ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: description } }],
            },
          },
        ]
      : [],
  })
}

export async function updatePage(pageId, { title }) {
  return notionRequest(`/pages/${pageId}`, 'PATCH', {
    properties: {
      Name: { title: [{ text: { content: title } }] },
    },
  })
}

export function getPageTitle(page) {
  const titleProp =
    page.properties?.Name?.title ??
    page.properties?.Title?.title ??
    Object.values(page.properties ?? {}).find((p) => p.type === 'title')?.title ??
    []
  return titleProp.map((t) => t.plain_text).join('') || 'Untitled'
}

export function getPageUrl(page) {
  return page.url ?? null
}
