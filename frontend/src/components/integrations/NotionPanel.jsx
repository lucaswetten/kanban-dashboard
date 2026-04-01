import { useState, useEffect } from 'react'
import { useNotionStore } from '../../store/notionStore'
import { useUiStore } from '../../store/uiStore'
import { useBoardStore } from '../../store/boardStore'
import { fetchPages, getPageTitle, getPageUrl } from '../../services/notionService'
import Spinner from '../ui/Spinner'
import './Panel.css'

export default function NotionPanel() {
  const { isConnected, databaseId, pages, loading, error, connect, disconnect } = useNotionStore()
  const { closePanel } = useUiStore()
  const { addCard, columns } = useBoardStore()
  const [dbInput, setDbInput] = useState(databaseId)

  useEffect(() => {
    if (isConnected && databaseId) fetchPages(databaseId)
  }, [isConnected, databaseId])

  function handleConnect(e) {
    e.preventDefault()
    const id = dbInput.trim()
    if (!id) return
    connect(id)
    fetchPages(id)
  }

  function importAsCard(page) {
    const firstCol = columns[0]
    if (!firstCol) return
    addCard(firstCol.id, {
      title: getPageTitle(page),
      description: '',
      labels: ['notion'],
      notionPageId: page.id,
    })
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-header-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/>
          </svg>
          Notion
        </div>
        <button className="panel-close" onClick={closePanel}>✕</button>
      </div>

      <div className="panel-body">
        {!isConnected ? (
          <form onSubmit={handleConnect} className="panel-connect-form">
            <p className="panel-connect-help">
              Enter your Notion Database ID to sync pages. Make sure the proxy server is running.
            </p>
            <input
              className="panel-input"
              placeholder="Database ID"
              value={dbInput}
              onChange={(e) => setDbInput(e.target.value)}
            />
            <a
              className="panel-help-link"
              href="https://developers.notion.com/docs/create-a-notion-integration"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to get your Database ID ↗
            </a>
            <button type="submit" className="panel-connect-btn">Connect</button>
          </form>
        ) : (
          <>
            {error && <p className="panel-error">{error}</p>}

            {loading ? (
              <div className="panel-center"><Spinner /></div>
            ) : pages.length === 0 ? (
              <div className="panel-empty">
                <p>No pages found in this database</p>
                <button className="panel-refresh" onClick={() => fetchPages(databaseId)}>Refresh</button>
              </div>
            ) : (
              <>
                <div className="panel-section-title">
                  Pages ({pages.length})
                  <button className="panel-refresh" onClick={() => fetchPages(databaseId)}>Refresh</button>
                </div>
                <div className="panel-list">
                  {pages.map((page) => {
                    const title = getPageTitle(page)
                    const url = getPageUrl(page)
                    return (
                      <div key={page.id} className="panel-event">
                        <div className="panel-event-dot notion" />
                        <div className="panel-event-info">
                          <p className="panel-event-title">{title}</p>
                          {url && (
                            <a className="panel-event-date" href={url} target="_blank" rel="noopener noreferrer">
                              Open in Notion ↗
                            </a>
                          )}
                        </div>
                        <button
                          className="panel-import-btn"
                          onClick={() => importAsCard(page)}
                          title="Import as card"
                        >
                          +
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {isConnected && (
        <div className="panel-footer">
          <p className="panel-db-id">DB: {databaseId}</p>
          <button className="panel-disconnect" onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  )
}
