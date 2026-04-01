import { useEffect } from 'react'
import { useUiStore } from './store/uiStore'
import { initGoogle } from './services/googleAuth'
import TopBar from './components/layout/TopBar'
import Board from './components/board/Board'
import CardModal from './components/board/CardModal'
import CalendarPanel from './components/integrations/CalendarPanel'
import NotionPanel from './components/integrations/NotionPanel'
import './App.css'

export default function App() {
  const { activePanel } = useUiStore()

  useEffect(() => {
    initGoogle()
  }, [])

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <Board />
        {activePanel === 'calendar' && <CalendarPanel />}
        {activePanel === 'notion' && <NotionPanel />}
      </div>
      <CardModal />
    </div>
  )
}
