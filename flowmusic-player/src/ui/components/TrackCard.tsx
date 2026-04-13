import { Flame, Heart, Play, Trash2 } from 'lucide-react'
import { Track } from '../../domain/models/Track'

interface TrackCardProps {
  track: Track
  position: number
  isCurrent: boolean
  onSelect: (trackId: string) => void
  onToggleFavorite: (trackId: string) => void
  onBurn: (track: Track) => void
  onRemove: (trackId: string) => void
}

export function TrackCard({
  track,
  position,
  isCurrent,
  onSelect,
  onToggleFavorite,
  onBurn,
  onRemove
}: TrackCardProps) {
  return (
    <article className={`playlist-track-card ${isCurrent ? 'current' : ''}`}>
      <div className="playlist-track-cover">
        <img
          className="playlist-track-image"
          src={track.cover}
          alt={`Portada de ${track.title}`}
        />
        <span className="playlist-track-order">{position}</span>
      </div>

      <div className="playlist-track-content">
        <div className="playlist-track-copy">
          <h4>{track.title}</h4>
          <p>
            {track.artist} • {track.album}
          </p>
        </div>

        <div className="playlist-track-meta">
          <span>{track.duration}</span>
          <small>{track.hasAudioSource() ? 'Audio listo' : 'Solo demo'}</small>
        </div>
      </div>

      <div className="playlist-track-actions">
        <button
          type="button"
          className="track-action-button"
          onClick={() => onSelect(track.id)}
        >
          <Play size={16} />
          <span>Seleccionar</span>
        </button>

        <button
          type="button"
          className={`track-action-button ${track.isFavorite ? 'favorite' : ''}`}
          onClick={() => onToggleFavorite(track.id)}
        >
          <Heart size={16} />
          <span>{track.isFavorite ? 'Favorita' : 'Favorito'}</span>
        </button>

        <button
          type="button"
          className="track-action-button"
          onClick={() => onBurn(track)}
        >
          <Flame size={16} />
          <span>Quemar</span>
        </button>

        <button
          type="button"
          className="track-action-button danger"
          onClick={() => onRemove(track.id)}
        >
          <Trash2 size={16} />
          <span>Eliminar</span>
        </button>
      </div>
    </article>
  )
}