import { Track } from '../../domain/models/Track'
import { TrackCard } from './TrackCard'

interface TrackListProps {
  tracks: Track[]
  currentTrackId: string | null
  hasTracks: boolean
  onSelect: (trackId: string) => void
  onToggleFavorite: (trackId: string) => void
  onBurn: (track: Track) => void
  onRemove: (trackId: string) => void
}

export function TrackList({
  tracks,
  currentTrackId,
  hasTracks,
  onSelect,
  onToggleFavorite,
  onBurn,
  onRemove
}: TrackListProps) {
  return (
    <section className="playlist-section-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Playlist</span>
          <h3>Lista de canciones</h3>
        </div>

        <p>Administra la secuencia principal del reproductor.</p>
      </div>

      {!hasTracks ? (
        <div className="playlist-empty-box">
          <h4>Tu playlist está vacía</h4>
          <p>
            Agrega una nueva canción desde el formulario para comenzar a usar
            FlowMusic Player.
          </p>
        </div>
      ) : tracks.length === 0 ? (
        <p className="empty-state">
          No se encontraron canciones con esa búsqueda.
        </p>
      ) : (
        <div className="playlist-track-list">
          {tracks.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              position={index + 1}
              isCurrent={currentTrackId === track.id}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
              onBurn={onBurn}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}