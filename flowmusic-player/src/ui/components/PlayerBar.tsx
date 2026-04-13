import { Track } from '../../domain/models/Track'

interface PlayerBarProps {
  currentTrack: Track | null
  isPlaying: boolean
  progressPercent: number
  elapsedTime: string
  totalTime: string
  onPrevious: () => void
  onPlay: () => void
  onPause: () => void
  onNext: () => void
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  progressPercent,
  elapsedTime,
  totalTime,
  onPrevious,
  onPlay,
  onPause,
  onNext
}: PlayerBarProps) {
  return (
    <footer className="player-bar-fixed">
      <div className="player-bar-main">
        <div className="player-bar-track">
          <div className="player-bar-avatar">
            {currentTrack ? currentTrack.title.charAt(0) : '♪'}
          </div>

          <div className="player-bar-details">
            <strong>
              {currentTrack ? currentTrack.title : 'No hay canción activa'}
            </strong>
            <span>
              {currentTrack
                ? `${currentTrack.artist} • ${currentTrack.album}`
                : 'Selecciona una canción para comenzar'}
            </span>
          </div>
        </div>

        <div className="player-bar-controls">
          <button onClick={onPrevious}>⏮</button>

          {isPlaying ? (
            <button className="player-primary-button" onClick={onPause}>
              ⏸
            </button>
          ) : (
            <button className="player-primary-button" onClick={onPlay}>
              ▶
            </button>
          )}

          <button onClick={onNext}>⏭</button>
        </div>

        <div className="player-bar-progress">
          <div className="player-bar-trackline">
            <div
              className="player-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="player-bar-times">
            <span>{elapsedTime}</span>
            <span>{totalTime}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}