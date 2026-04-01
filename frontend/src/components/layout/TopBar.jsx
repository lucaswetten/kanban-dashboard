import { useState } from 'react'
import { useGoogleStore } from '../../store/googleStore'
import { useNotionStore } from '../../store/notionStore'
import { useUiStore } from '../../store/uiStore'
import { useBoardStore } from '../../store/boardStore'
import { signIn, signOut } from '../../services/googleAuth'
import Spinner from '../ui/Spinner'
import './TopBar.css'

export default function TopBar() {
  const { isConnected: gcalConnected, loading: gcalLoading } = useGoogleStore()
  const { isConnected: notionConnected } = useNotionStore()
  const { togglePanel, activePanel } = useUiStore()
  const { boardTitle, setBoardTitle } = useBoardStore()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(boardTitle)

  function handleTitleSubmit() {
    if (titleDraft.trim()) setBoardTitle(titleDraft.trim())
    setEditingTitle(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" opacity="0.9"/>
            <rect x="13" y="3" width="8" height="11" rx="2" fill="currentColor" opacity="0.7"/>
            <rect x="13" y="17" width="8" height="4" rx="2" fill="var(--color-accent)"/>
          </svg>
          <span className="topbar-brand">KanbanSync</span>
        </div>

        <div className="topbar-divider" />

        {editingTitle ? (
          <input
            className="topbar-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
          />
        ) : (
          <button
            className="topbar-title"
            onClick={() => { setTitleDraft(boardTitle); setEditingTitle(true) }}
          >
            {boardTitle}
          </button>
        )}
      </div>

      <div className="topbar-right">
        {/* Google Calendar button */}
        <button
          className={`integration-btn ${gcalConnected ? 'connected' : ''} ${activePanel === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            if (!gcalConnected) signIn()
            else togglePanel('calendar')
          }}
          title={gcalConnected ? 'Google Calendar connected' : 'Connect Google Calendar'}
        >
          {gcalLoading ? (
            <Spinner size={14} color="#fff" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
            </svg>
          )}
          <span>{gcalConnected ? 'Calendar' : 'Connect Calendar'}</span>
          {gcalConnected && <span className="status-dot" />}
        </button>

        {/* Notion button */}
        <button
          className={`integration-btn ${notionConnected ? 'connected' : ''} ${activePanel === 'notion' ? 'active' : ''}`}
          onClick={() => togglePanel('notion')}
          title={notionConnected ? 'Notion connected' : 'Connect Notion'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
          </svg>
          <span>{notionConnected ? 'Notion' : 'Connect Notion'}</span>
          {notionConnected && <span className="status-dot" />}
        </button>

        {gcalConnected && (
          <button className="topbar-icon-btn" onClick={signOut} title="Disconnect Google">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
