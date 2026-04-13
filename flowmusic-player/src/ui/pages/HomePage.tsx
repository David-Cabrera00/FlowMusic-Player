import { useEffect, useMemo, useRef, useState } from 'react'
import { Track } from '../../domain/models/Track'
import { BurnedTrack } from '../../domain/models/BurnedTrack'
import { FlowPlaylist } from '../../domain/services/FlowPlaylist'
import { PlayerController } from '../../domain/services/PlayerController'
import { seedTracks } from '../../data/seedTracks'
import { Sidebar} from '../components/Sidebar'
import type { SidebarSection } from '../components/Sidebar'
import { Header } from '../components/Header'
import { NowPlaying } from '../components/NowPlaying'
import { TrackForm } from '../components/TrackForm'
import { TrackList } from '../components/TrackList'
import { CollectionPanels } from '../components/CollectionPanels'
import { HistoryPanel } from '../components/HistoryPanel'
import { PlayerBar } from '../components/PlayerBar'

type ThemeMode = 'dark' | 'light'

type StoredTrack = {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  cover: string
  isFavorite: boolean
  audioSrc?: string
}

type StoredBurnedTrack = {
  track: StoredTrack
  burnedAt: string
}

const TRACKS_STORAGE_KEY = 'flowmusic-tracks'
const BURNED_STORAGE_KEY = 'flowmusic-burned'
const HISTORY_STORAGE_KEY = 'flowmusic-history'
const VOLUME_STORAGE_KEY = 'flowmusic-volume'
const MUTE_STORAGE_KEY = 'flowmusic-muted'

function toTrack(data: StoredTrack): Track {
  return new Track(
    data.id,
    data.title,
    data.artist,
    data.album,
    data.duration,
    data.cover,
    data.isFavorite,
    data.audioSrc ?? ''
  )
}

function trackToStored(track: Track): StoredTrack {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    cover: track.cover,
    isFavorite: track.isFavorite,
    audioSrc: track.audioSrc
  }
}

function burnedToStored(item: BurnedTrack): StoredBurnedTrack {
  return {
    track: trackToStored(item.track),
    burnedAt: item.burnedAt.toISOString()
  }
}

function storedToBurned(item: StoredBurnedTrack): BurnedTrack {
  return new BurnedTrack(toTrack(item.track), new Date(item.burnedAt))
}

function cloneSeedTracks(): Track[] {
  return seedTracks.map(
    (track) =>
      new Track(
        track.id,
        track.title,
        track.artist,
        track.album,
        track.duration,
        track.cover,
        track.isFavorite,
        track.audioSrc
      )
  )
}

function loadStoredTracks(): Track[] {
  try {
    const rawValue = localStorage.getItem(TRACKS_STORAGE_KEY)

    if (!rawValue) {
      return cloneSeedTracks()
    }

    const parsedValue = JSON.parse(rawValue) as StoredTrack[]

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return cloneSeedTracks()
    }

    return parsedValue.map(toTrack)
  } catch {
    return cloneSeedTracks()
  }
}

function loadStoredBurnedTracks(): BurnedTrack[] {
  try {
    const rawValue = localStorage.getItem(BURNED_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue) as StoredBurnedTrack[]

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map(storedToBurned)
  } catch {
    return []
  }
}

function loadStoredHistory(): Track[] {
  try {
    const rawValue = localStorage.getItem(HISTORY_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue) as StoredTrack[]

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map(toTrack)
  } catch {
    return []
  }
}

function isSessionAudioSource(audioSrc: string): boolean {
  return audioSrc.startsWith('blob:')
}

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const shouldAutoPlayRef = useRef(false)

  const initialTracks = useMemo(() => loadStoredTracks(), [])

  const playlist = useMemo(() => {
    const instance = new FlowPlaylist()
    initialTracks.forEach((track) => instance.addToEnd(track))
    return instance
  }, [initialTracks])

  const player = useMemo(() => {
    return new PlayerController(playlist)
  }, [playlist])

  const [tracks, setTracks] = useState<Track[]>(playlist.toArray())
  const [currentTrack, setCurrentTrack] = useState<Track | null>(
    playlist.getCurrentTrack()
  )
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [durationSeconds, setDurationSeconds] = useState<number>(() => {
    const track = playlist.getCurrentTrack()
    if (!track) {
      return 0
    }

    const [minutes, seconds] = track.duration.split(':').map(Number)
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return 0
    }

    return minutes * 60 + seconds
  })
  const [burnedTracks, setBurnedTracks] = useState<BurnedTrack[]>(() =>
    loadStoredBurnedTracks()
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [historyTracks, setHistoryTracks] = useState<Track[]>(() => {
    const storedHistory = loadStoredHistory()

    if (storedHistory.length > 0) {
      return storedHistory
    }

    const initialTrack = playlist.getCurrentTrack()
    return initialTrack ? [initialTrack] : []
  })
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('flowmusic-theme')
    return savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'dark'
  })
  const [volume, setVolume] = useState<number>(() => {
    const storedVolume = Number(localStorage.getItem(VOLUME_STORAGE_KEY))
    return Number.isNaN(storedVolume) ? 70 : storedVolume
  })
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
  })
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [activeSection, setActiveSection] =
    useState<SidebarSection>('inicio')

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

  async function readAudioDurationFromFile(
    file: File
  ): Promise<{ durationSeconds: number; objectUrl: string }> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const audio = document.createElement('audio')

      audio.preload = 'metadata'

      audio.onloadedmetadata = () => {
        const realDuration = Number.isFinite(audio.duration)
          ? Math.floor(audio.duration)
          : 0

        resolve({
          durationSeconds: Math.max(0, realDuration),
          objectUrl
        })
      }

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(`No se pudo leer el archivo: ${file.name}`))
      }

      audio.src = objectUrl
    })
  }

  function createImportedTrack(
    file: File,
    audioSrc: string,
    durationInSeconds: number
  ): Track {
    const cleanName = file.name.replace(/\.[^/.]+$/, '')
    const generatedId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const fallbackCover = `https://picsum.photos/seed/${encodeURIComponent(generatedId)}/300/300`
    const formattedDuration = formatTime(durationInSeconds)

    return new Track(
      generatedId,
      cleanName,
      'Archivo local',
      'Importado',
      formattedDuration,
      fallbackCover,
      false,
      audioSrc
    )
  }

  async function importSelectedFiles(fileList: FileList | null): Promise<void> {
    if (!fileList) {
      return
    }

    const audioFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith('audio/')
    )

    if (audioFiles.length === 0) {
      return
    }

    setIsImporting(true)

    try {
      const createdTracks: Track[] = []

      for (const file of audioFiles) {
        const { durationSeconds, objectUrl } = await readAudioDurationFromFile(file)
        const importedTrack = createImportedTrack(file, objectUrl, durationSeconds)
        createdTracks.push(importedTrack)
      }

      createdTracks.forEach((track) => {
        playlist.addToEnd(track)
      })

      if (createdTracks.length > 0) {
        const firstImportedTrack = createdTracks[0]
        player.select(firstImportedTrack.id)
        setActiveSection('biblioteca')
        appendHistory(firstImportedTrack)
      }

      refreshView()
    } finally {
      setIsImporting(false)
    }
  }

  useEffect(() => {
    const folderInput = folderInputRef.current

    if (folderInput) {
      folderInput.setAttribute('webkitdirectory', '')
      folderInput.setAttribute('directory', '')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('flowmusic-theme', theme)
  }, [theme])

  useEffect(() => {
    const persistableTracks = tracks.filter(
      (track) => !isSessionAudioSource(track.audioSrc)
    )

    localStorage.setItem(
      TRACKS_STORAGE_KEY,
      JSON.stringify(persistableTracks.map(trackToStored))
    )
  }, [tracks])

  useEffect(() => {
    const persistableBurned = burnedTracks.filter(
      (item) => !isSessionAudioSource(item.track.audioSrc)
    )

    localStorage.setItem(
      BURNED_STORAGE_KEY,
      JSON.stringify(persistableBurned.map(burnedToStored))
    )
  }, [burnedTracks])

  useEffect(() => {
    const persistableHistory = historyTracks.filter(
      (track) => !isSessionAudioSource(track.audioSrc)
    )

    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(persistableHistory.map(trackToStored))
    )
  }, [historyTracks])

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
  }, [volume])

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted))
  }, [isMuted])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    resetProgress()

    if (!currentTrack) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      setDurationSeconds(0)
      setIsPlaying(false)
      shouldAutoPlayRef.current = false
      return
    }

    setDurationSeconds(parseDurationToSeconds(currentTrack.duration))

    if (!currentTrack.hasAudioSource()) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      setIsPlaying(false)
      shouldAutoPlayRef.current = false
      return
    }

    audio.src = currentTrack.audioSrc
    audio.load()

    if (shouldAutoPlayRef.current) {
      const playPromise = audio.play()

      if (playPromise) {
        playPromise
          .then(() => {
            player.play()
            setIsPlaying(true)
          })
          .catch(() => {
            player.pause()
            setIsPlaying(false)
          })
      }
    } else {
      player.pause()
      setIsPlaying(false)
    }

    shouldAutoPlayRef.current = false
  }, [currentTrack, player])

  const currentIndex = currentTrack
    ? tracks.findIndex((track) => track.id === currentTrack.id)
    : -1

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex >= 0 && currentIndex < tracks.length - 1

  const handleLoadedMetadata = (): void => {
    const audio = audioRef.current

    if (!audio || !currentTrack) {
      return
    }

    const realDuration = Math.floor(audio.duration)

    if (realDuration <= 0) {
      return
    }

    setDurationSeconds(realDuration)

    const formattedDuration = formatTime(realDuration)

    if (currentTrack.duration !== formattedDuration) {
      currentTrack.duration = formattedDuration
      setTracks([...playlist.toArray()])
      setCurrentTrack(playlist.getCurrentTrack())
    }
  }

  const handleTimeUpdate = (): void => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const total = Number.isFinite(audio.duration) ? audio.duration : 0
    const current = audio.currentTime

    setElapsedSeconds(Math.floor(current))

    const nextPercent = total > 0 ? (current / total) * 100 : 0
    setProgressPercent(nextPercent)
    player.setProgress(nextPercent)
  }

  const handleEnded = (): void => {
    if (!canGoNext) {
      player.pause()
      setIsPlaying(false)
      setProgressPercent(100)
      return
    }

    const nextTrack = player.next()
    shouldAutoPlayRef.current = true
    appendHistory(nextTrack)
    refreshView()
  }

  const handlePlay = (): void => {
    if (!currentTrack || !currentTrack.hasAudioSource()) {
      return
    }

    const audio = audioRef.current

    if (!audio) {
      return
    }

    const playPromise = audio.play()

    if (playPromise) {
      playPromise
        .then(() => {
          player.play()
          setIsPlaying(true)
          appendHistory(currentTrack)
        })
        .catch(() => {
          player.pause()
          setIsPlaying(false)
        })
    }
  }

  const handlePause = (): void => {
    const audio = audioRef.current
    audio?.pause()
    player.pause()
    setIsPlaying(false)
  }

  const handleNext = (): void => {
    if (!canGoNext) {
      return
    }

    const nextTrack = player.next()
    shouldAutoPlayRef.current = isPlaying

    if (nextTrack) {
      appendHistory(nextTrack)
    }

    refreshView()
  }

  const handlePrevious = (): void => {
    if (!canGoPrevious) {
      return
    }

    const previousTrack = player.previous()
    shouldAutoPlayRef.current = isPlaying

    if (previousTrack) {
      appendHistory(previousTrack)
    }

    refreshView()
  }

  const handleSelectTrack = (trackId: string): void => {
    const wasSelected = player.select(trackId)
    shouldAutoPlayRef.current = isPlaying

    if (wasSelected) {
      appendHistory(player.getCurrentTrack())
    }

    refreshView()
  }

  const handleRemoveTrack = (trackId: string): void => {
    const selectedTrack = tracks.find((track) => track.id === trackId)

    if (!selectedTrack) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${selectedTrack.title}" de la playlist?`
    )

    if (!confirmed) {
      return
    }

    const wasCurrentTrack = currentTrack?.id === trackId

    if (selectedTrack.audioSrc.startsWith('blob:')) {
      URL.revokeObjectURL(selectedTrack.audioSrc)
    }

    if (wasCurrentTrack) {
      audioRef.current?.pause()
      player.pause()
      setIsPlaying(false)
    }

    const updatedBurnedTracks = burnedTracks.filter(
      (item) => item.track.id !== trackId
    )

    playlist.removeById(trackId)
    setBurnedTracks(updatedBurnedTracks)
    setHistoryTracks((previousHistory) =>
      previousHistory.filter((item) => item.id !== trackId)
    )

    refreshView()
  }

  const handleToggleFavorite = (trackId: string): void => {
    const selectedTrack = tracks.find((track) => track.id === trackId)

    if (!selectedTrack) {
      return
    }

    selectedTrack.toggleFavorite()
    setTracks([...playlist.toArray()])
  }
  
  const handleToggleCurrentFavorite = (): void => {
  if (!currentTrack) {
    return
  }

  handleToggleFavorite(currentTrack.id)
  setCurrentTrack(playlist.getCurrentTrack())
}

  const handleBurnTrack = (track: Track): void => {
    const alreadyExists = burnedTracks.some((item) => item.track.id === track.id)

    if (alreadyExists) {
      return
    }

    setBurnedTracks((previous) => [...previous, new BurnedTrack(track)])
  }

  const handleAddToStart = (track: Track): void => {
    playlist.addToStart(track)
    setActiveSection('biblioteca')
    refreshView()
  }

  const handleAddToEnd = (track: Track): void => {
    playlist.addToEnd(track)
    setActiveSection('biblioteca')
    refreshView()
  }

  const handleAddToPosition = (track: Track, position: number): void => {
    playlist.addAtPosition(track, position)
    setActiveSection('biblioteca')
    refreshView()
  }

  const handleToggleTheme = (): void => {
    setTheme((previousTheme) =>
      previousTheme === 'dark' ? 'light' : 'dark'
    )
  }

  const handleClearSearch = (): void => {
    setSearchTerm('')
  }

  const handleSearchChange = (value: string): void => {
  const normalizedValue = value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
  setSearchTerm(normalizedValue)
}

  const handleVolumeChange = (value: number): void => {
    setVolume(value)
    setIsMuted(value === 0)
  }

  const handleToggleMute = (): void => {
    setIsMuted((previous) => !previous)
  }

  const handleOpenFilesImport = (): void => {
    fileInputRef.current?.click()
  }

  const handleOpenFolderImport = (): void => {
    folderInputRef.current?.click()
  }

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    await importSelectedFiles(event.target.files)
    event.target.value = ''
  }

  const handleNavigateSection = (section: SidebarSection): void => {
    setActiveSection(section)
    setSearchTerm('')
  }

  const favoriteTracks = tracks.filter((track) => track.isFavorite)
  const burnedOnlyTracks = burnedTracks.map((item) => item.track)
  const historyOnlyTracks = historyTracks

  function filterTracksBySearch(sourceTracks: Track[]): Track[] {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return sourceTracks
    }

    return sourceTracks.filter((track) => {
      return (
        track.title.toLowerCase().includes(normalizedSearch) ||
        track.artist.toLowerCase().includes(normalizedSearch) ||
        track.album.toLowerCase().includes(normalizedSearch)
      )
    })
  }

  const libraryTracks = filterTracksBySearch(tracks)
const filteredFavorites = filterTracksBySearch(favoriteTracks)
const filteredBurned = filterTracksBySearch(burnedOnlyTracks)
const filteredHistory = filterTracksBySearch(historyOnlyTracks)
const homePreviewTracks = libraryTracks.slice(0, 6)
const showAuxiliaryPanel = activeSection === 'biblioteca'

  const totalTime = currentTrack
    ? durationSeconds > 0
      ? formatTime(durationSeconds)
      : currentTrack.duration
    : '--:--'

  const elapsedTime = currentTrack ? formatTime(elapsedSeconds) : '--:--'

  const sectionTitleMap: Record<SidebarSection, string> = {
    inicio: 'Inicio',
    biblioteca: 'Biblioteca',
    favoritas: 'Favoritas',
    quemadas: 'Quemadas',
    historial: 'Historial'
  }

  return (
    <div className="app-shell">
      <div
  className={`dashboard-layout ${showAuxiliaryPanel ? '' : 'dashboard-layout--focused'}`}
        >
        <Sidebar
          theme={theme}
          activeSection={activeSection}
          onToggleTheme={handleToggleTheme}
          onNavigate={handleNavigateSection}
          totalTracks={tracks.length}
          favoriteCount={favoriteTracks.length}
          burnedCount={burnedTracks.length}
          historyCount={historyTracks.length}
          isPlaying={isPlaying}
        />

        <main className="center-panel">
          <Header
            title={sectionTitleMap[activeSection]}
            section={activeSection}
            searchTerm={searchTerm}
            isImporting={isImporting}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onImportFiles={handleOpenFilesImport}
            onImportFolder={handleOpenFolderImport}
          />

          <NowPlaying
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            elapsedTime={elapsedTime}
            totalTime={totalTime}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={handlePrevious}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
          />

          {activeSection === 'biblioteca' ? (
            <TrackForm
              playlistSize={tracks.length}
              onAddToStart={handleAddToStart}
              onAddToEnd={handleAddToEnd}
              onAddToPosition={handleAddToPosition}
            />
            ) : null}

          {activeSection === 'inicio' ? (
            <TrackList
              tracks={homePreviewTracks}
              totalSourceCount={tracks.length}
              currentTrackId={currentTrack?.id ?? null}
              title="Accesos rápidos"
              subtitle="Selección principal de tu biblioteca."
              emptyTitle="Tu biblioteca está vacía"
              emptyDescription="Agrega una nueva canción o importa archivos para comenzar."
              emptySearchMessage="No se encontraron canciones con esa búsqueda."
              onSelect={handleSelectTrack}
              onToggleFavorite={handleToggleFavorite}
              onBurn={handleBurnTrack}
              onRemove={handleRemoveTrack}
            />
          ) : null}

          {activeSection === 'biblioteca' ? (
            <TrackList
              tracks={libraryTracks}
              totalSourceCount={tracks.length}
              currentTrackId={currentTrack?.id ?? null}
              title="Biblioteca completa"
              subtitle="Todas las canciones disponibles en tu reproductor."
              emptyTitle="Tu biblioteca está vacía"
              emptyDescription="Agrega una nueva canción o importa archivos desde tu computador."
              emptySearchMessage="No se encontraron canciones con esa búsqueda."
              onSelect={handleSelectTrack}
              onToggleFavorite={handleToggleFavorite}
              onBurn={handleBurnTrack}
              onRemove={handleRemoveTrack}
            />
          ) : null}

          {activeSection === 'favoritas' ? (
            <TrackList
              tracks={filteredFavorites}
              totalSourceCount={favoriteTracks.length}
              currentTrackId={currentTrack?.id ?? null}
              title="Canciones favoritas"
              subtitle="Tu selección personal de canciones destacadas."
              emptyTitle="No tienes favoritas todavía"
              emptyDescription="Marca canciones como favoritas desde la biblioteca para verlas aquí."
              emptySearchMessage="No se encontraron favoritas con esa búsqueda."
              onSelect={handleSelectTrack}
              onToggleFavorite={handleToggleFavorite}
              onBurn={handleBurnTrack}
              onRemove={handleRemoveTrack}
            />
          ) : null}

          {activeSection === 'quemadas' ? (
            <TrackList
              tracks={filteredBurned}
              totalSourceCount={burnedOnlyTracks.length}
              currentTrackId={currentTrack?.id ?? null}
              title="Canciones quemadas"
              subtitle="Colección especial registrada dentro del sistema."
              emptyTitle="No has quemado canciones"
              emptyDescription="Usa la acción “Quemar” sobre cualquier canción para verla aquí."
              emptySearchMessage="No se encontraron canciones quemadas con esa búsqueda."
              onSelect={handleSelectTrack}
              onToggleFavorite={handleToggleFavorite}
              onBurn={handleBurnTrack}
              onRemove={handleRemoveTrack}
            />
          ) : null}

          {activeSection === 'historial' ? (
            <TrackList
              tracks={filteredHistory}
              totalSourceCount={historyOnlyTracks.length}
              currentTrackId={currentTrack?.id ?? null}
              title="Historial de reproducción"
              subtitle="Canciones reproducidas o seleccionadas recientemente."
              emptyTitle="No hay historial todavía"
              emptyDescription="Reproduce o selecciona canciones para construir el historial del reproductor."
              emptySearchMessage="No se encontraron elementos del historial con esa búsqueda."
              onSelect={handleSelectTrack}
              onToggleFavorite={handleToggleFavorite}
              onBurn={handleBurnTrack}
              onRemove={handleRemoveTrack}
            />
          ) : null}
        </main>

        {showAuxiliaryPanel ? (
          <aside className="right-panel">
            <CollectionPanels
              favoriteTracks={favoriteTracks}
              burnedTracks={burnedTracks}
            />

            <HistoryPanel historyTracks={historyTracks} />
          </aside>
        ) : null}
      </div>

      <PlayerBar
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      progressPercent={progressPercent}
      elapsedTime={elapsedTime}
      totalTime={totalTime}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      volume={volume}
      isMuted={isMuted}
      isFavorite={Boolean(currentTrack?.isFavorite)}
      onPrevious={handlePrevious}
      onPlay={handlePlay}
      onPause={handlePause}
      onNext={handleNext}
      onVolumeChange={handleVolumeChange}
      onToggleMute={handleToggleMute}
      onToggleFavorite={handleToggleCurrentFavorite}
      />

      <audio
        ref={audioRef}
        hidden
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFilesSelected}
      />

      <input
        ref={folderInputRef}
        hidden
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFilesSelected}
      />
    </div>
  )
}