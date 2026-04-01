import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import Card from './Card'
import { useBoardStore } from '../../store/boardStore'
import './Column.css'

export default function Column({ column }) {
  const { cards, addCard, updateColumn, deleteColumn } = useBoardStore()
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)

  function handleAddCard() {
    if (!newCardTitle.trim()) return
    addCard(column.id, { title: newCardTitle.trim() })
    setNewCardTitle('')
    setAddingCard(false)
  }

  function handleTitleSave() {
    if (titleDraft.trim()) updateColumn(column.id, { title: titleDraft.trim() })
    setEditingTitle(false)
  }

  return (
    <div className="column">
      <div className="column-header">
        {editingTitle ? (
          <input
            className="column-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            autoFocus
          />
        ) : (
          <button
            className="column-title"
            onClick={() => { setTitleDraft(column.title); setEditingTitle(true) }}
          >
            {column.title}
          </button>
        )}

        <div className="column-header-right">
          <span className="column-count">{column.cardIds.length}</span>
          <div className="column-menu-wrap">
            <button
              className="column-menu-btn"
              onClick={() => setShowMenu((v) => !v)}
            >
              ···
            </button>
            {showMenu && (
              <div className="column-menu" onMouseLeave={() => setShowMenu(false)}>
                <button onClick={() => { setAddingCard(true); setShowMenu(false) }}>
                  Add card
                </button>
                <button onClick={() => { setTitleDraft(column.title); setEditingTitle(true); setShowMenu(false) }}>
                  Rename
                </button>
                <button
                  className="danger"
                  onClick={() => { deleteColumn(column.id); setShowMenu(false) }}
                >
                  Delete column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {column.cardIds.map((cardId, index) =>
              cards[cardId] ? (
                <Card key={cardId} card={cards[cardId]} index={index} />
              ) : null
            )}
            {provided.placeholder}

            {addingCard && (
              <div className="add-card-form">
                <textarea
                  className="add-card-input"
                  placeholder="Card title…"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                    if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') }
                  }}
                  autoFocus
                  rows={2}
                />
                <div className="add-card-actions">
                  <button className="btn-add-confirm" onClick={handleAddCard}>Add card</button>
                  <button className="btn-add-cancel" onClick={() => { setAddingCard(false); setNewCardTitle('') }}>✕</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {!addingCard && (
        <button className="add-card-btn" onClick={() => setAddingCard(true)}>
          <span>+</span> Add a card
        </button>
      )}
    </div>
  )
}
