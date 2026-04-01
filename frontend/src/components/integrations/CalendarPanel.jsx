import { useEffect } from 'react'
import { format } from 'date-fns'
import { useGoogleStore } from '../../store/googleStore'
import { useUiStore } from '../../store/uiStore'
import { useBoardStore } from '../../store/boardStore'
import { fetchUpcomingEvents, formatEventDate } from '../../services/googleCalendar'
import { signOut } from '../../services/googleAuth'
import Spinner from '../ui/Spinner'
import './Panel.css'

export default function CalendarPanel() {
  const { events, loading, error, isConnected } = useGoogleStore()
  const { closePanel } = useUiStore()
  const { addCard, columns } = useBoardStore()

  useEffect(() => {
    if (isConnected) fetchUpcomingEvents()
  }, [isConnected])

  function importAsCard(event) {
    const firstCol = columns[0]
    if (!firstCol) return
    addCard(firstCol.id, {
      title: event.summary ?? 'Untitled event',
      description: event.description ?? '',
      dueDate: formatEventDate(event)?.toISOString() ?? null,
      labels: ['calendar'],
    })
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Google Calendar
        </div>
        <button className="panel-close" onClick={closePanel}>✕</button>
      </div>

      <div className="panel-body">
        {error && <p className="panel-error">{error}</p>}

        {loading ? (
          <div className="panel-center"><Spinner /></div>
        ) : events.length === 0 ? (
          <div className="panel-empty">
            <p>No upcoming events</p>
            <button className="panel-refresh" onClick={fetchUpcomingEvents}>Refresh</button>
          </div>
        ) : (
          <>
            <div className="panel-section-title">
              Upcoming events
              <button className="panel-refresh" onClick={fetchUpcomingEvents}>Refresh</button>
            </div>
            <div className="panel-list">
              {events.map((event) => {
                const date = formatEventDate(event)
                return (
                  <div key={event.id} className="panel-event">
                    <div className="panel-event-dot" />
                    <div className="panel-event-info">
                      <p className="panel-event-title">{event.summary ?? 'Untitled'}</p>
                      {date && (
                        <p className="panel-event-date">{format(date, 'EEE, MMM d · h:mm a')}</p>
                      )}
                    </div>
                    <button
                      className="panel-import-btn"
                      onClick={() => importAsCard(event)}
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
      </div>

      <div className="panel-footer">
        <button className="panel-disconnect" onClick={signOut}>
          Disconnect
        </button>
      </div>
    </div>
  )
}
