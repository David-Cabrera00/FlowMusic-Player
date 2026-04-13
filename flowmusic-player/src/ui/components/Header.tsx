import { Search, X } from 'lucide-react'

interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
}

export function Header({
  searchTerm,
  onSearchChange,
  onClearSearch
}: HeaderProps) {
  return (
    <header className="top-header">
      <div className="top-header-copy">
        <span className="eyebrow-label">FlowMusic Player</span>
        <h2>Biblioteca</h2>
      </div>

      <div className="search-shell">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por título, artista o álbum"
          />
        </div>

        <button
          className="clear-search-button"
          type="button"
          onClick={onClearSearch}
          disabled={!searchTerm.trim()}
        >
          <X size={16} />
          <span>Limpiar</span>
        </button>
      </div>
    </header>
  )
}