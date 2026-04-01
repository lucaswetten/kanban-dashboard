import { Draggable } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { PriorityBadge, LabelBadge } from '../ui/Badge'
import { useUiStore } from '../../store/uiStore'
import './Card.css'

export default function Card({ card, index }) {
  const { openCardModal } = useUiStore()

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card ${snapshot.isDragging ? 'card--dragging' : ''}`}
          onClick={() => openCardModal(card.id)}
        >
          {/* Priority indicator */}
          <div className={`card-priority-bar priority-bar-${card.priority}`} />

          <div className="card-body">
            <p className="card-title">{card.title}</p>

            {card.description && (
              <p className="card-desc">{card.description}</p>
            )}

            {card.labels?.length > 0 && (
              <div className="card-labels">
                {card.labels.map((l) => (
                  <LabelBadge key={l} label={l} />
                ))}
              </div>
            )}

            <div className="card-footer">
              <PriorityBadge priority={card.priority} />

              <div className="card-footer-right">
                {card.calendarEventId && (
                  <span className="card-icon" title="Linked to Google Calendar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}
                {card.notionPageId && (
                  <span className="card-icon" title="Linked to Notion">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z"/>
                    </svg>
                  </span>
                )}
                {card.dueDate && (
                  <span className={`card-due ${isOverdue ? 'overdue' : ''}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {format(new Date(card.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
