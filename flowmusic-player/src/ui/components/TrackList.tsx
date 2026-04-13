import { Track } from '../../domain/models/Track'
import { TrackCard } from './TrackCard'

interface TrackListProps {
  tracks: Track[]
  totalSourceCount: number
  currentTrackId: string | null
  title: string
  subtitle: string
  emptyTitle: string
  emptyDescription: string
  emptySearchMessage: string
  onSelect: (trackId: string) => void
  onToggleFavorite: (trackId: string) => void
  onBurn: (track: Track) => void
  onRemove: (trackId: string) => void
}

export function TrackList({
  tracks,
  totalSourceCount,
  currentTrackId,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  emptySearchMessage,
  onSelect,
  onToggleFavorite,
  onBurn,
  onRemove
}: TrackListProps) {
  return (
    <section className="playlist-section-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Colección</span>
          <h3>{title}</h3>
        </div>

        <p>{subtitle}</p>
      </div>

      {totalSourceCount === 0 ? (
        <div className="playlist-empty-box">
          <h4>{emptyTitle}</h4>
          <p>{emptyDescription}</p>
        </div>
      ) : tracks.length === 0 ? (
        <p className="empty-state">{emptySearchMessage}</p>
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