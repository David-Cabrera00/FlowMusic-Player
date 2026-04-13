import { useEffect, useMemo, useState } from 'react'
import { Track } from '../../domain/models/Track'
import { BurnedTrack } from '../../domain/models/BurnedTrack'
import { BurnCollection } from '../../domain/services/BurnCollection'
import { FlowPlaylist } from '../../domain/services/FlowPlaylist'
import { PlayerController } from '../../domain/services/PlayerController'
import { seedTracks } from '../../data/seedTracks'
import { TrackForm } from '../components/TrackForm'
import { ThemeToggle } from '../components/ThemeToggle'
import { CollectionPanels } from '../components/CollectionPanels'
import { HistoryPanel } from '../components/HistoryPanel'
import { PlayerBar } from '../components/PlayerBar'

type ThemeMode = 'dark' | 'light'

export default function HomePage() {
  const playlist = useMemo(() => {
    const instance = new FlowPlaylist()
    seedTracks.forEach((track) => instance.addToEnd(track))
    return instance
  }, [])

  const player = useMemo(() => {
    return new PlayerController(playlist)
  }, [playlist])

  const burnCollection = useMemo(() => {
    return new BurnCollection()
  }, [])

  const [tracks, setTracks] = useState<Track[]>(playlist.toArray())
  const [currentTrack, setCurrentTrack] = useState<Track | null>(
    playlist.getCurrentTrack()
  )
  const [isPlaying, setIsPlaying] = useState<boolean>(player.isActive())
  const [progressPercent, setProgressPercent] = useState<number>(
    player.getProgress()
  )
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [burnedCount, setBurnedCount] = useState<number>(
    burnCollection.getAll().length
  )
  const [burnedTracks, setBurnedTracks] = useState<BurnedTrack[]>(
    burnCollection.getAll()
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [historyTracks, setHistoryTracks] = useState<Track[]>(() => {
    const initialTrack = playlist.getCurrentTrack()
    return initialTrack ? [initialTrack] : []
  })
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('flowmusic-theme')
    return savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'dark'
  })

  function parseDurationToSeconds(duration: string): number {
    const parts = duration.split(':').map(Number)

    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return 0
    }

    return parts[0] * 60 + parts[1]
  }

  function formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, totalSeconds)
    const minutes = Math.floor(safeSeconds / 60)
    const seconds = safeSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function refreshView(): void {
    setTracks([...playlist.toArray()])
    setCurrentTrack(playlist.getCurrentTrack())
    setIsPlaying(player.isActive())
    setProgressPercent(player.getProgress())
    setBurnedCount(burnCollection.getAll().length)
    setBurnedTracks(burnCollection.getAll())
  }

  function appendHistory(track: Track | null): void {
    if (!track) {
      return
    }

    setHistoryTracks((previousHistory) => {
      const cleanedHistory = previousHistory.filter(
        (item) => item.id !== track.id
      )

      return [track, ...cleanedHistory].slice(0, 8)
    })
  }

  function resetProgress(): void {
    player.setProgress(0)
    setProgressPercent(0)
    setElapsedSeconds(0)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('flowmusic-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!isPlaying || !currentTrack) {
      return
    }

    const totalSeconds = parseDurationToSeconds(currentTrack.duration)

    if (totalSeconds <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((previousSeconds) => {
        const nextElapsedSeconds = Math.min(previousSeconds + 1, totalSeconds)
        const nextPercent = (nextElapsedSeconds / totalSeconds) * 100

        player.setProgress(nextPercent)
        setProgressPercent(nextPercent)

        if (nextElapsedSeconds >= totalSeconds) {
          const previousTrackId = currentTrack.id
          const nextTrack = player.next()

          player.setProgress(0)

          if (nextTrack && nextTrack.id !== previousTrackId) {
            player.play()
            appendHistory(nextTrack)

            setTimeout(() => {
              setElapsedSeconds(0)
              refreshView()
            }, 0)
          } else {
            player.pause()

            setTimeout(() => {
              setElapsedSeconds(totalSeconds)
              refreshView()
            }, 0)
          }
        }

        return nextElapsedSeconds
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPlaying, currentTrack, player])

  const handlePlay = (): void => {
    player.play()
    appendHistory(player.getCurrentTrack())
    refreshView()
  }

  const handlePause = (): void => {
    player.pause()
    refreshView()
  }

  const handleNext = (): void => {
    const previousTrackId = currentTrack?.id
    const nextTrack = player.next()

    resetProgress()

    if (nextTrack && nextTrack.id !== previousTrackId) {
      appendHistory(nextTrack)
    }

    refreshView()
  }

  const handlePrevious = (): void => {
    const previousTrackId = currentTrack?.id
    const previousTrack = player.previous()

    resetProgress()

    if (previousTrack && previousTrack.id !== previousTrackId) {
      appendHistory(previousTrack)
    }

    refreshView()
  }

  const handleSelectTrack = (trackId: string): void => {
    const wasSelected = player.select(trackId)

    resetProgress()

    if (wasSelected) {
      appendHistory(player.getCurrentTrack())
    }

    refreshView()
  }

  const handleRemoveTrack = (trackId: string): void => {
    playlist.removeById(trackId)
    resetProgress()
    refreshView()
  }

  const handleToggleFavorite = (trackId: string): void => {
    const selectedTrack = tracks.find((track) => track.id === trackId)

    if (!selectedTrack) {
      return
    }

    selectedTrack.toggleFavorite()
    refreshView()
  }

  const handleBurnTrack = (track: Track): void => {
    burnCollection.add(track)
    refreshView()
  }

  const handleAddToStart = (track: Track): void => {
    playlist.addToStart(track)
    refreshView()
  }

  const handleAddToEnd = (track: Track): void => {
    playlist.addToEnd(track)
    refreshView()
  }

  const handleAddToPosition = (track: Track, position: number): void => {
    playlist.addAtPosition(track, position)
    refreshView()
  }

  const handleToggleTheme = (): void => {
    setTheme((previousTheme) =>
      previousTheme === 'dark' ? 'light' : 'dark'
    )
  }

  const favoriteTracks = tracks.filter((track) => track.isFavorite)

  const filteredTracks = tracks.filter((track) => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return true
    }

    return (
      track.title.toLowerCase().includes(normalizedSearch) ||
      track.artist.toLowerCase().includes(normalizedSearch) ||
      track.album.toLowerCase().includes(normalizedSearch)
    )
  })

  const totalTime = currentTrack ? currentTrack.duration : '--:--'
  const elapsedTime = currentTrack ? formatTime(elapsedSeconds) : '--:--'

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="brand-box">
          <h1>FlowMusic</h1>
          <p>Player académico</p>
        </div>

        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

        <nav className="menu-box">
          <button className="menu-item active">Inicio</button>
          <button className="menu-item">Biblioteca</button>
          <button className="menu-item">Favoritos</button>
          <button className="menu-item">Quemadas</button>
          <button className="menu-item">Historial</button>
        </nav>

        <div className="summary-card">
          <h3>Resumen</h3>
          <p>Canciones: {tracks.length}</p>
          <p>Favoritas: {favoriteTracks.length}</p>
          <p>Quemadas: {burnedCount}</p>
          <p>Historial: {historyTracks.length}</p>
          <p>Estado: {isPlaying ? 'Reproduciendo' : 'En pausa'}</p>
          <p>Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
        </div>
      </aside>

      <main className="main-panel">
        <section className="hero-card">
          <div>
            <span className="tag">Reproductor</span>
            <h2>Reproductor para tu día a día</h2>
            <p>
              FlowMusic Player usa una estructura enlazada con navegación hacia
              adelante y hacia atrás para gestionar la playlist de manera
              académica, visual y profesional.
            </p>
          </div>
        </section>

        <section className="search-card">
          <div className="section-header">
            <h3>Buscar canciones</h3>
            <p>Filtra por título, artista o álbum</p>
          </div>

          <input
            className="search-input"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar canción..."
          />
        </section>

        <section className="current-track-card">
          <div className="cover-placeholder">
            {currentTrack ? currentTrack.title.charAt(0) : '♪'}
          </div>

          <div className="current-track-info">
            <p className="section-label">Canción actual</p>
            <h3>{currentTrack ? currentTrack.title : 'No hay canción activa'}</h3>
            <p>
              {currentTrack
                ? `${currentTrack.artist} • ${currentTrack.album}`
                : 'Agrega canciones para comenzar'}
            </p>
            <p>{currentTrack ? `Duración: ${currentTrack.duration}` : ''}</p>
          </div>

          <div className="player-actions">
            <button onClick={handlePrevious}>⏮ Anterior</button>
            <button onClick={handlePlay}>▶ Reproducir</button>
            <button onClick={handlePause}>⏸ Pausar</button>
            <button onClick={handleNext}>⏭ Siguiente</button>
          </div>
        </section>

        <TrackForm
          playlistSize={tracks.length}
          onAddToStart={handleAddToStart}
          onAddToEnd={handleAddToEnd}
          onAddToPosition={handleAddToPosition}
        />

        <CollectionPanels
          favoriteTracks={favoriteTracks}
          burnedTracks={burnedTracks}
        />

        <HistoryPanel historyTracks={historyTracks} />

        <section className="list-section">
          <div className="section-header">
            <h3>Lista de canciones</h3>
            <p>Selecciona una canción o gestiona la playlist</p>
          </div>

          <div className="track-list">
            {filteredTracks.length === 0 ? (
              <p className="empty-state">
                No se encontraron canciones con esa búsqueda.
              </p>
            ) : (
              filteredTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id

                return (
                  <article
                    key={track.id}
                    className={`track-card ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="track-number">{index + 1}</div>

                    <div className="track-details">
                      <h4>{track.title}</h4>
                      <p>
                        {track.artist} • {track.album}
                      </p>
                      <span>{track.duration}</span>
                    </div>

                    <div className="track-actions">
                      <button onClick={() => handleSelectTrack(track.id)}>
                        Seleccionar
                      </button>
                      <button onClick={() => handleToggleFavorite(track.id)}>
                        {track.isFavorite ? 'Quitar favorito' : 'Favorito'}
                      </button>
                      <button onClick={() => handleBurnTrack(track)}>
                        Quemar
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </main>

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progressPercent={progressPercent}
        elapsedTime={elapsedTime}
        totalTime={totalTime}
        onPrevious={handlePrevious}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
      />
    </div>
  )
}