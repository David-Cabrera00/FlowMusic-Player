import {
  Disc3,
  Flame,
  Heart,
  History,
  Home,
  LibraryBig,
  Music2
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  totalTracks: number
  favoriteCount: number
  burnedCount: number
  historyCount: number
  isPlaying: boolean
}

export function Sidebar({
  theme,
  onToggleTheme,
  totalTracks,
  favoriteCount,
  burnedCount,
  historyCount,
  isPlaying
}: SidebarProps) {
  return (
    <aside className="sidebar-panel">
      <div className="brand-block">
        <div className="brand-icon">
          <Disc3 size={22} />
        </div>

        <div>
          <h1>FlowMusic</h1>
          <p>Player académico</p>
        </div>
      </div>

      <ThemeToggle theme={theme} onToggle={onToggleTheme} />

      <nav className="sidebar-nav">
        <button className="sidebar-link active" type="button">
          <Home size={18} />
          <span>Inicio</span>
        </button>

        <button className="sidebar-link" type="button">
          <LibraryBig size={18} />
          <span>Biblioteca</span>
        </button>

        <button className="sidebar-link" type="button">
          <Heart size={18} />
          <span>Favoritas</span>
        </button>

        <button className="sidebar-link" type="button">
          <Flame size={18} />
          <span>Quemadas</span>
        </button>

        <button className="sidebar-link" type="button">
          <History size={18} />
          <span>Historial</span>
        </button>
      </nav>

      <section className="sidebar-status-card">
        <div className="sidebar-status-header">
          <Music2 size={18} />
          <span>Estado del sistema</span>
        </div>

        <div className="sidebar-status-grid">
          <div className="sidebar-stat-item">
            <strong>{totalTracks}</strong>
            <span>Canciones</span>
          </div>

          <div className="sidebar-stat-item">
            <strong>{favoriteCount}</strong>
            <span>Favoritas</span>
          </div>

          <div className="sidebar-stat-item">
            <strong>{burnedCount}</strong>
            <span>Quemadas</span>
          </div>

          <div className="sidebar-stat-item">
            <strong>{historyCount}</strong>
            <span>Historial</span>
          </div>
        </div>

        <div className="sidebar-live-pill">
          <span className={`live-dot ${isPlaying ? 'playing' : ''}`} />
          <span>{isPlaying ? 'Reproduciendo' : 'En pausa'}</span>
        </div>
      </section>
    </aside>
  )
}