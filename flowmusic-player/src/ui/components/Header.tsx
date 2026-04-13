import { FolderOpen, Search, Upload, X } from 'lucide-react'

interface HeaderProps {
  searchTerm: string
  isImporting: boolean
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onImportFiles: () => void
  onImportFolder: () => void
}

export function Header({
  searchTerm,
  isImporting,
  onSearchChange,
  onClearSearch,
  onImportFiles,
  onImportFolder
}: HeaderProps) {
  return (
    <header className="library-header">
      <div className="library-header-copy">
        <span className="eyebrow-label">FlowMusic Player</span>
        <h2>Biblioteca</h2>
      </div>

      <div className="library-toolbar">
        <div className="library-search-box">
          <Search size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar "
          />
        </div>

        <div className="library-toolbar-buttons">
          <button
            className="library-toolbar-button"
            type="button"
            onClick={onImportFiles}
            disabled={isImporting}
          >
            <Upload size={16} />
            <span>{isImporting ? 'Importando...' : 'Importar archivos'}</span>
          </button>

          <button
            className="library-toolbar-button"
            type="button"
            onClick={onImportFolder}
            disabled={isImporting}
          >
            <FolderOpen size={16} />
            <span>Importar carpeta</span>
          </button>

          <button
            className="library-clear-button"
            type="button"
            onClick={onClearSearch}
            disabled={!searchTerm.trim()}
          >
            <X size={16} />
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </header>
  )
}