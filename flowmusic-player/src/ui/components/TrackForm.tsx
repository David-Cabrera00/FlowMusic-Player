import { useRef, useState, type ChangeEvent } from 'react'
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
  const [position, setPosition] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isReadingDuration, setIsReadingDuration] = useState(false)

  const audioInputRef = useRef<HTMLInputElement | null>(null)

  const normalizeTextInput = (value: string): string => {
    return value.replace(/^\s+/, '')
  }

  const normalizeStoredText = (value: string): string => {
    return value.trim().replace(/\s{2,}/g, ' ')
  }

  const sanitizePositionInput = (value: string): string => {
    return value.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  }

  const clearForm = (): void => {
    setTitle('')
    setArtist('')
    setAlbum('')
    setDuration('')
    setPosition('')
    setAudioFile(null)

    if (audioInputRef.current) {
      audioInputRef.current.value = ''
    }
  }

  const formatTime = (totalSeconds: number): string => {
    const safeSeconds = Math.max(0, totalSeconds)
    const minutes = Math.floor(safeSeconds / 60)
    const seconds = safeSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const readAudioDuration = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file)
      const audio = document.createElement('audio')

      audio.preload = 'metadata'

      audio.onloadedmetadata = () => {
        const realDuration = Number.isFinite(audio.duration)
          ? Math.floor(audio.duration)
          : 0

        URL.revokeObjectURL(tempUrl)
        resolve(formatTime(realDuration))
      }

      audio.onerror = () => {
        URL.revokeObjectURL(tempUrl)
        reject(new Error('No se pudo leer la duración del audio.'))
      }

      audio.src = tempUrl
    })
  }

  const handleAudioFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0] ?? null

    setAudioFile(selectedFile)
    setDuration('')
    setError('')
    setSuccess('')

    if (!selectedFile) {
      return
    }

    setIsReadingDuration(true)

    try {
      const detectedDuration = await readAudioDuration(selectedFile)
      setDuration(detectedDuration)
    } catch {
      setError('No se pudo leer el archivo de audio seleccionado.')
    } finally {
      setIsReadingDuration(false)
    }
  }

  const validateForm = (): boolean => {
    const cleanTitle = normalizeStoredText(title)
    const cleanArtist = normalizeStoredText(artist)
    const cleanAlbum = normalizeStoredText(album)

    if (!cleanTitle || !cleanArtist || !cleanAlbum) {
      setError('Completa todos los campos obligatorios.')
      setSuccess('')
      return false
    }

    if (!audioFile) {
      setError('Debes seleccionar un archivo de audio.')
      setSuccess('')
      return false
    }

    if (!duration) {
      setError('No se pudo calcular la duración del audio.')
      setSuccess('')
      return false
    }

    return true
  }

  const buildTrack = (): Track => {
    const generatedId = `track-${Date.now()}`
    const audioObjectUrl = URL.createObjectURL(audioFile as File)
    const fallbackCover = `https://picsum.photos/seed/${generatedId}/300/300`

    return new Track(
      generatedId,
      normalizeStoredText(title),
      normalizeStoredText(artist),
      normalizeStoredText(album),
      duration,
      fallbackCover,
      false,
      audioObjectUrl
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

    const userPosition = Number(position)
    const maxUserPosition = playlistSize + 1

    if (
      Number.isNaN(userPosition) ||
      userPosition < 1 ||
      userPosition > maxUserPosition
    ) {
      setError(`La posición debe estar entre 1 y ${maxUserPosition}.`)
      setSuccess('')
      return
    }

    const internalPosition = userPosition - 1

    onAddToPosition(buildTrack(), internalPosition)
    setError('')
    setSuccess(`Canción agregada en la posición ${userPosition}.`)
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
            onChange={(event) => setTitle(normalizeTextInput(event.target.value))}
            placeholder="Ejemplo: Aurora Urbana"
          />
        </div>

        <div className="form-field">
          <label htmlFor="artist">Artista</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(event) => setArtist(normalizeTextInput(event.target.value))}
            placeholder="Ejemplo: Nova Beat"
          />
        </div>

        <div className="form-field">
          <label htmlFor="album">Álbum</label>
          <input
            id="album"
            type="text"
            value={album}
            onChange={(event) => setAlbum(normalizeTextInput(event.target.value))}
            placeholder="Ejemplo: Skyline Dreams"
          />
        </div>

        <div className="form-field">
          <label htmlFor="audioFile">Archivo de audio</label>

          <div className="file-picker">
            <label htmlFor="audioFile" className="file-picker-button">
              {audioFile ? 'Cambiar audio' : 'Elegir audio'}
            </label>

            <span className={`file-picker-name ${audioFile ? 'selected' : ''}`}>
              {audioFile ? audioFile.name : 'Ningún archivo seleccionado'}
            </span>
          </div>

          <input
            ref={audioInputRef}
            id="audioFile"
            className="file-input-hidden"
            type="file"
            accept="audio/*"
            onChange={handleAudioFileChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="duration">Duración</label>
          <input
            id="duration"
            type="text"
            value={isReadingDuration ? 'Leyendo audio...' : duration}
            readOnly
            placeholder="Se calcula automáticamente"
          />
        </div>

        <div className="form-field">
          <label htmlFor="position">Posición</label>
          <input
            id="position"
            type="text"
            inputMode="numeric"
            value={position}
            onChange={(event) => setPosition(sanitizePositionInput(event.target.value))}
            placeholder={`1 a ${playlistSize + 1}`}
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