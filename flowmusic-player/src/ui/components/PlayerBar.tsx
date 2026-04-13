import type { CSSProperties } from 'react'
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Track } from '../../domain/models/Track'

interface PlayerBarProps {
  currentTrack: Track | null
  isPlaying: boolean
  progressPercent: number
  elapsedTime: string
  totalTime: string
  canGoPrevious: boolean
  canGoNext: boolean
  volume: number
  isMuted: boolean
  isFavorite: boolean
  onPrevious: () => void
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onVolumeChange: (value: number) => void
  onToggleMute: () => void
  onToggleFavorite: () => void
  onSeek: (value: number) => void
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  progressPercent,
  elapsedTime,
  totalTime,
  canGoPrevious,
  canGoNext,
  volume,
  isMuted,
  isFavorite,
  onPrevious,
  onPlay,
  onPause,
  onNext,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onSeek
}: PlayerBarProps) {
  const canPlayTrack = Boolean(currentTrack?.hasAudioSource())
  const hasTrack = Boolean(currentTrack)
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : Volume2

  const seekStyle = {
    ['--seek-fill' as string]: `${progressPercent}%`
  } as CSSProperties

  const volumeStyle = {
    ['--volume-fill' as string]: `${isMuted ? 0 : volume}%`
  } as CSSProperties

  return (
    <footer className="player-bar-fixed">
      <div className="player-bar-main">
        <div className="player-bar-left">
          <div className="player-bar-cover-wrap">
            {currentTrack ? (
              <img
                className="player-bar-cover-image"
                src={currentTrack.cover}
                alt={`Portada de ${currentTrack.title}`}
              />
            ) : (
              <div className="player-bar-avatar">FM</div>
            )}
          </div>

          <div className="player-bar-copy">
            <strong>
              {currentTrack ? currentTrack.title : 'No hay canción activa'}
            </strong>
            <span>
              {currentTrack
                ? `${currentTrack.artist} • ${currentTrack.album}`
                : 'Selecciona una canción para comenzar'}
            </span>
          </div>

          <button
            type="button"
            className={`player-favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            disabled={!hasTrack}
            title={isFavorite ? 'Quitar de favoritas' : 'Agregar a favoritas'}
          >
            <Heart size={18} />
          </button>
        </div>

        <div className="player-bar-center">
          <div className="player-bar-controls">
            <button type="button" onClick={onPrevious} disabled={!canGoPrevious}>
              <SkipBack size={18} />
            </button>

            {isPlaying ? (
              <button
                type="button"
                className="player-primary-button"
                onClick={onPause}
                disabled={!canPlayTrack}
              >
                <Pause size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="player-primary-button"
                onClick={onPlay}
                disabled={!canPlayTrack}
              >
                <Play size={18} />
              </button>
            )}

            <button type="button" onClick={onNext} disabled={!canGoNext}>
              <SkipForward size={18} />
            </button>
          </div>

          <div className="player-bar-progress-row">
            <span>{elapsedTime}</span>

            <input
              className="player-progress-slider"
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPercent}
              style={seekStyle}
              disabled={!canPlayTrack}
              onChange={(event) => onSeek(Number(event.target.value))}
            />

            <span>{totalTime}</span>
          </div>
        </div>

        <div className="player-bar-right">
          <button
            type="button"
            className="volume-icon-button"
            onClick={onToggleMute}
          >
            <VolumeIcon size={18} />
          </button>

          <input
            className="volume-slider"
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            style={volumeStyle}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </div>
      </div>
    </footer>
  )
}