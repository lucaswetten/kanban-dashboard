import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import { useBoardStore } from '../../store/boardStore'
import './Board.css'

export default function Board() {
  const { columns, moveCard, addColumn } = useBoardStore()
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  function handleDragEnd(result) {
    const { draggableId, source, destination } = result
    if (!destination) return
    moveCard(draggableId, source, destination)
  }

  function handleAddColumn() {
    if (!newColumnTitle.trim()) return
    addColumn(newColumnTitle.trim())
    setNewColumnTitle('')
    setAddingColumn(false)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board">
        {columns.map((col) => (
          <Column key={col.id} column={col} />
        ))}

        <div className="add-column-wrap">
          {addingColumn ? (
            <div className="add-column-form">
              <input
                className="add-column-input"
                placeholder="Column name…"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn()
                  if (e.key === 'Escape') { setAddingColumn(false); setNewColumnTitle('') }
                }}
                autoFocus
              />
              <div className="add-column-actions">
                <button className="btn-add-confirm" onClick={handleAddColumn}>Add column</button>
                <button className="btn-add-cancel" onClick={() => { setAddingColumn(false); setNewColumnTitle('') }}>✕</button>
              </div>
            </div>
          ) : (
            <button className="add-column-btn" onClick={() => setAddingColumn(true)}>
              <span className="add-column-icon">+</span>
              Add column
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  )
}
