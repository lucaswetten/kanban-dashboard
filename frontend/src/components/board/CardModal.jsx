import { useState, useEffect } from 'react'
import { useBoardStore } from '../../store/boardStore'
import { useUiStore } from '../../store/uiStore'
import { useGoogleStore } from '../../store/googleStore'
import { useNotionStore } from '../../store/notionStore'
import { createEvent, deleteEvent } from '../../services/googleCalendar'
import { createPage, getPageTitle, getPageUrl } from '../../services/notionService'
import { fetchPages } from '../../services/notionService'
import Modal from '../ui/Modal'
import { PriorityBadge } from '../ui/Badge'
import Spinner from '../ui/Spinner'
import './CardModal.css'

const PRIORITIES = ['low', 'medium', 'high', 'critical']

export default function CardModal() {
  const { isCardModalOpen, selectedCardId, closeCardModal } = useUiStore()
  const { cards, updateCard, deleteCard } = useBoardStore()
  const { isConnected: gcalConnected, events } = useGoogleStore()
  const { isConnected: notionConnected, databaseId, pages } = useNotionStore()

  const card = cards[selectedCardId]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState([])
  const [syncingCalendar, setSyncingCalendar] = useState(false)
  const [syncingNotion, setSyncingNotion] = useState(false)
  const [notionPages, setNotionPages] = useState(pages)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description ?? '')
      setPriority(card.priority)
      setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '')
      setLabels(card.labels ?? [])
    }
  }, [card])

  useEffect(() => {
    setNotionPages(pages)
  }, [pages])

  if (!card) return null

  function handleSave() {
    updateCard(card.id, {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels,
    })
    closeCardModal()
  }

  function handleDelete() {
    deleteCard(card.id)
    closeCardModal()
  }

  function addLabel() {
    const l = labelInput.trim().toLowerCase()
    if (l && !labels.includes(l)) setLabels([...labels, l])
    setLabelInput('')
  }

  async function syncToCalendar() {
    if (!gcalConnected) return
    setSyncingCalendar(true)
    try {
      if (card.calendarEventId) {
        await deleteEvent(card.calendarEventId)
        updateCard(card.id, { calendarEventId: null })
      } else {
        const event = await createEvent({
          title,
          description,
          startDate: dueDate ? new Date(dueDate) : new Date(),
        })
        updateCard(card.id, { calendarEventId: event.id })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSyncingCalendar(false)
    }
  }

  async function loadNotionPages() {
    if (!notionConnected || !databaseId) return
    setSyncingNotion(true)
    try {
      const p = await fetchPages(databaseId)
      setNotionPages(p)
    } finally {
      setSyncingNotion(false)
    }
  }

  async function syncToNotion() {
    if (!notionConnected || !databaseId) return
    setSyncingNotion(true)
    try {
      const page = await createPage(databaseId, { title, description })
      updateCard(card.id, { notionPageId: page.id })
    } catch (e) {
      console.error(e)
    } finally {
      setSyncingNotion(false)
    }
  }

  function linkNotionPage(pageId) {
    updateCard(card.id, { notionPageId: pageId })
  }

  return (
    <Modal isOpen={isCardModalOpen} onClose={closeCardModal} width={620}>
      <div className="card-modal">
        <div className="cm-main">
          <div className="cm-priority-strip" data-priority={priority} />

          <div className="cm-content">
            <textarea
              className="cm-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              rows={1}
            />

            <div className="cm-field">
              <label className="cm-label">Description</label>
              <textarea
                className="cm-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                rows={4}
              />
            </div>

            <div className="cm-row">
              <div className="cm-field">
                <label className="cm-label">Priority</label>
                <div className="cm-priority-list">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      className={`cm-priority-opt ${priority === p ? 'selected' : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      <PriorityBadge priority={p} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="cm-field">
                <label className="cm-label">Due Date</label>
                <input
                  type="date"
                  className="cm-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="cm-field">
              <label className="cm-label">Labels</label>
              <div className="cm-labels">
                {labels.map((l) => (
                  <span key={l} className="cm-label-tag">
                    {l}
                    <button onClick={() => setLabels(labels.filter((x) => x !== l))}>✕</button>
                  </span>
                ))}
                <input
                  className="cm-label-input"
                  placeholder="Add label…"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integrations sidebar */}
        <div className="cm-sidebar">
          <p className="cm-sidebar-title">Integrations</p>

          {/* Google Calendar */}
          <div className="cm-integration-block">
            <div className="cm-integration-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Google Calendar</span>
            </div>
            {gcalConnected ? (
              <div>
                <p className="cm-integration-status connected">Connected</p>
                {card.calendarEventId && (
                  <p className="cm-integration-linked">
                    Event linked
                    <a
                      href={`https://calendar.google.com/calendar/r/eventedit/${card.calendarEventId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ↗
                    </a>
                  </p>
                )}
                <button
                  className="cm-integration-btn"
                  onClick={syncToCalendar}
                  disabled={syncingCalendar}
                >
                  {syncingCalendar ? <Spinner size={12} /> : null}
                  {card.calendarEventId ? 'Unlink event' : 'Create calendar event'}
                </button>
              </div>
            ) : (
              <p className="cm-integration-status">Not connected</p>
            )}
          </div>

          {/* Notion */}
          <div className="cm-integration-block">
            <div className="cm-integration-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/>
              </svg>
              <span>Notion</span>
            </div>
            {notionConnected ? (
              <div>
                <p className="cm-integration-status connected">Connected</p>
                {card.notionPageId ? (
                  <p className="cm-integration-linked">Page linked</p>
                ) : (
                  <button className="cm-integration-btn" onClick={syncToNotion} disabled={syncingNotion}>
                    {syncingNotion ? <Spinner size={12} /> : null}
                    Create Notion page
                  </button>
                )}
                <button className="cm-integration-btn secondary" onClick={loadNotionPages} disabled={syncingNotion}>
                  {syncingNotion ? <Spinner size={12} /> : null}
                  Link existing page
                </button>
                {notionPages.length > 0 && (
                  <div className="cm-notion-pages">
                    {notionPages.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        className={`cm-notion-page ${card.notionPageId === p.id ? 'linked' : ''}`}
                        onClick={() => linkNotionPage(p.id)}
                      >
                        {getPageTitle(p)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="cm-integration-status">Not connected</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cm-footer">
        <button className="cm-btn-delete" onClick={handleDelete}>
          Delete card
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="cm-btn-cancel" onClick={closeCardModal}>Cancel</button>
          <button className="cm-btn-save" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </Modal>
  )
}
