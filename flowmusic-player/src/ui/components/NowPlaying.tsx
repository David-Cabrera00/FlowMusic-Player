import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Track } from '../../domain/models/Track'

interface NowPlayingProps {
  currentTrack: Track | null
  isPlaying: boolean
  elapsedTime: string
  totalTime: string
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onPlay: () => void
  onPause: () => void
  onNext: () => void
}

export function NowPlaying({
  currentTrack,
  isPlaying,
  elapsedTime,
  totalTime,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onPlay,
  onPause,
  onNext
}: NowPlayingProps) {
  return (
    <section className="now-playing-card">
      <div className="now-playing-cover-wrap">
        {currentTrack ? (
          <img
            className="now-playing-cover-image"
            src={currentTrack.cover}
            alt={`Portada de ${currentTrack.title}`}
          />
        ) : (
          <div className="now-playing-placeholder">FM</div>
        )}
      </div>

      <div className="now-playing-content">
        <div className="now-playing-copy">
          <span className="eyebrow-label">Ahora sonando</span>
          <h3>{currentTrack ? currentTrack.title : 'No hay canción activa'}</h3>
          <p>
            {currentTrack
              ? `${currentTrack.artist} • ${currentTrack.album}`
              : 'Agrega o selecciona una canción para comenzar'}
          </p>
          <small>
            {currentTrack
              ? `${elapsedTime} / ${totalTime}`
              : '00:00 / --:--'}
          </small>
        </div>

        <div className="now-playing-controls">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="icon-control-button"
          >
            <SkipBack size={18} />
          </button>

          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              disabled={!currentTrack}
              className="primary-play-button"
            >
              <Pause size={18} />
              <span>Pausar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              disabled={!currentTrack}
              className="primary-play-button"
            >
              <Play size={18} />
              <span>Reproducir</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="icon-control-button"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}