import { useState } from 'react'
import { Track } from '../../domain/models/Track'

interface TrackFormProps {
  playlistSize: number
  onAddToStart: (track: Track) => void
  onAddToEnd: (track: Track) => void
  onAddToPosition: (track: Track, position: number) => void
}

export function TrackForm({
  playlistSize,
  onAddToStart,
  onAddToEnd,
  onAddToPosition
}: TrackFormProps) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [duration, setDuration] = useState('')
  const [cover, setCover] = useState('')
  const [audioSrc, setAudioSrc] = useState('')
  const [position, setPosition] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const clearForm = (): void => {
    setTitle('')
    setArtist('')
    setAlbum('')
    setDuration('')
    setCover('')
    setAudioSrc('')
    setPosition('')
  }

  const validateForm = (): boolean => {
    if (!title.trim() || !artist.trim() || !album.trim() || !duration.trim()) {
      setError('Completa todos los campos obligatorios.')
      setSuccess('')
      return false
    }

    const durationPattern = /^\d{1,2}:\d{2}$/

    if (!durationPattern.test(duration.trim())) {
      setError('La duración debe tener formato mm:ss.')
      setSuccess('')
      return false
    }

    return true
  }

  const buildTrack = (): Track => {
    const generatedId = `track-${Date.now()}`
    const fallbackCover = `https://picsum.photos/seed/${generatedId}/300/300`

    return new Track(
      generatedId,
      title.trim(),
      artist.trim(),
      album.trim(),
      duration.trim(),
      cover.trim() || fallbackCover,
      false,
      audioSrc.trim()
    )
  }

  const handleAddToStart = (): void => {
    if (!validateForm()) {
      return
    }

    onAddToStart(buildTrack())
    setError('')
    setSuccess('Canción agregada al inicio correctamente.')
    clearForm()
  }

  const handleAddToEnd = (): void => {
    if (!validateForm()) {
      return
    }

    onAddToEnd(buildTrack())
    setError('')
    setSuccess('Canción agregada al final correctamente.')
    clearForm()
  }

  const handleAddToPosition = (): void => {
    if (!validateForm()) {
      return
    }

    if (position.trim() === '') {
      setError('Debes indicar una posición.')
      setSuccess('')
      return
    }

    const numericPosition = Number(position)

    if (
      Number.isNaN(numericPosition) ||
      numericPosition < 0 ||
      numericPosition > playlistSize
    ) {
      setError(`La posición debe estar entre 0 y ${playlistSize}.`)
      setSuccess('')
      return
    }

    onAddToPosition(buildTrack(), numericPosition)
    setError('')
    setSuccess('Canción agregada en la posición indicada.')
    clearForm()
  }

  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Nueva canción</span>
          <h3>Agregar canción</h3>
        </div>

        <p>Inserta canciones al inicio, al final o en una posición específica.</p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ejemplo: Aurora Urbana"
          />
        </div>

        <div className="form-field">
          <label htmlFor="artist">Artista</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Ejemplo: Nova Beat"
          />
        </div>

        <div className="form-field">
          <label htmlFor="album">Álbum</label>
          <input
            id="album"
            type="text"
            value={album}
            onChange={(event) => setAlbum(event.target.value)}
            placeholder="Ejemplo: Skyline Dreams"
          />
        </div>

        <div className="form-field">
          <label htmlFor="duration">Duración</label>
          <input
            id="duration"
            type="text"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="03:45"
          />
        </div>

        <div className="form-field">
          <label htmlFor="cover">Portada URL</label>
          <input
            id="cover"
            type="text"
            value={cover}
            onChange={(event) => setCover(event.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="form-field">
          <label htmlFor="audioSrc">Audio URL</label>
          <input
            id="audioSrc"
            type="text"
            value={audioSrc}
            onChange={(event) => setAudioSrc(event.target.value)}
            placeholder="Opcional por ahora"
          />
        </div>

        <div className="form-field">
          <label htmlFor="position">Posición</label>
          <input
            id="position"
            type="number"
            min={0}
            max={playlistSize}
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder={`0 a ${playlistSize}`}
          />
        </div>
      </div>

      {error ? <p className="form-message error">{error}</p> : null}
      {success ? <p className="form-message success">{success}</p> : null}

      <div className="form-actions">
        <button type="button" onClick={handleAddToStart}>
          Agregar al inicio
        </button>
        <button type="button" onClick={handleAddToEnd}>
          Agregar al final
        </button>
        <button type="button" onClick={handleAddToPosition}>
          Agregar por posición
        </button>
      </div>
    </section>
  )
}