import { useMemo, useState } from 'react'
import { Track } from '../../domain/models/Track'
import { BurnCollection } from '../../domain/services/BurnCollection'
import { FlowPlaylist } from '../../domain/services/FlowPlaylist'
import { PlayerController } from '../../domain/services/PlayerController'
import { seedTracks } from '../../data/seedTracks'
import { TrackForm } from '../components/TrackForm'

export function HomePage() {
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
  const [burnedCount, setBurnedCount] = useState<number>(
    burnCollection.getAll().length
  )

  const refreshView = (): void => {
    setTracks([...playlist.toArray()])
    setCurrentTrack(playlist.getCurrentTrack())
    setIsPlaying(player.isActive())
    setBurnedCount(burnCollection.getAll().length)
  }

  const handlePlay = (): void => {
    player.play()
    refreshView()
  }

  const handlePause = (): void => {
    player.pause()
    refreshView()
  }

  const handleNext = (): void => {
    player.next()
    refreshView()
  }

  const handlePrevious = (): void => {
    player.previous()
    refreshView()
  }

  const handleSelectTrack = (trackId: string): void => {
    player.select(trackId)
    refreshView()
  }

  const handleRemoveTrack = (trackId: string): void => {
    playlist.removeById(trackId)
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

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="brand-box">
          <h1>FlowMusic</h1>
          <p>Player académico</p>
        </div>

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
          <p>Quemadas: {burnedCount}</p>
          <p>Estado: {isPlaying ? 'Reproduciendo' : 'En pausa'}</p>
        </div>
      </aside>

      <main className="main-panel">
        <section className="hero-card">
          <div>
            <span className="tag">Reproductor</span>
            <h2>Reproductor para tu día a día</h2>
            <p>
              FlowMusic Player usa una estructura enlazada con navegación hacia
              adelante y hacia atrás para gestionar la playlist.
            </p>
          </div>
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

        <section className="list-section">
          <div className="section-header">
            <h3>Lista de canciones</h3>
            <p>Selecciona una canción o gestiona la playlist</p>
          </div>

          <div className="track-list">
            {tracks.map((track, index) => {
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
            })}
          </div>
        </section>
      </main>
    </div>
  )
}