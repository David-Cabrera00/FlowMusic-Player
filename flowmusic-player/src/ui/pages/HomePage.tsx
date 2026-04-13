import { useEffect, useMemo, useState } from 'react'
import { Track } from '../../domain/models/Track'
import { BurnedTrack } from '../../domain/models/BurnedTrack'
import { FlowPlaylist } from '../../domain/services/FlowPlaylist'
import { PlayerController } from '../../domain/services/PlayerController'
import { seedTracks } from '../../data/seedTracks'
import { Sidebar } from '../components/Sidebar'
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
    data.isFavorite
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
    isFavorite: track.isFavorite
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
        track.isFavorite
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

export default function HomePage() {
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
  const [isPlaying, setIsPlaying] = useState<boolean>(player.isActive())
  const [progressPercent, setProgressPercent] = useState<number>(
    player.getProgress()
  )
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
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
    localStorage.setItem(
      TRACKS_STORAGE_KEY,
      JSON.stringify(tracks.map(trackToStored))
    )
  }, [tracks])

  useEffect(() => {
    localStorage.setItem(
      BURNED_STORAGE_KEY,
      JSON.stringify(burnedTracks.map(burnedToStored))
    )
  }, [burnedTracks])

  useEffect(() => {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(historyTracks.map(trackToStored))
    )
  }, [historyTracks])

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
  }, [volume])

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted))
  }, [isMuted])

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
    if (!currentTrack) {
      return
    }

    player.play()
    appendHistory(player.getCurrentTrack())
    refreshView()
  }

  const handlePause = (): void => {
    player.pause()
    refreshView()
  }

  const currentIndex = currentTrack
    ? tracks.findIndex((track) => track.id === currentTrack.id)
    : -1

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex >= 0 && currentIndex < tracks.length - 1

  const handleNext = (): void => {
    if (!canGoNext) {
      return
    }

    const previousTrackId = currentTrack?.id
    const nextTrack = player.next()

    resetProgress()

    if (nextTrack && nextTrack.id !== previousTrackId) {
      appendHistory(nextTrack)
    }

    refreshView()
  }

  const handlePrevious = (): void => {
    if (!canGoPrevious) {
      return
    }

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

    const updatedBurnedTracks = burnedTracks.filter(
      (item) => item.track.id !== trackId
    )

    playlist.removeById(trackId)
    setBurnedTracks(updatedBurnedTracks)
    setHistoryTracks((previousHistory) =>
      previousHistory.filter((item) => item.id !== trackId)
    )

    resetProgress()
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

  const handleBurnTrack = (track: Track): void => {
    const alreadyExists = burnedTracks.some((item) => item.track.id === track.id)

    if (alreadyExists) {
      return
    }

    setBurnedTracks((previous) => [...previous, new BurnedTrack(track)])
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

  const handleClearSearch = (): void => {
    setSearchTerm('')
  }

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value)
  }

  const handleVolumeChange = (value: number): void => {
    setVolume(value)
    setIsMuted(value === 0)
  }

  const handleToggleMute = (): void => {
    setIsMuted((previous) => !previous)
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
      <div className="dashboard-layout">
        <Sidebar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          totalTracks={tracks.length}
          favoriteCount={favoriteTracks.length}
          burnedCount={burnedTracks.length}
          historyCount={historyTracks.length}
          isPlaying={isPlaying}
        />

        <main className="center-panel">
          <Header
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
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

          <TrackForm
            playlistSize={tracks.length}
            onAddToStart={handleAddToStart}
            onAddToEnd={handleAddToEnd}
            onAddToPosition={handleAddToPosition}
          />

          <TrackList
            tracks={filteredTracks}
            currentTrackId={currentTrack?.id ?? null}
            hasTracks={tracks.length > 0}
            onSelect={handleSelectTrack}
            onToggleFavorite={handleToggleFavorite}
            onBurn={handleBurnTrack}
            onRemove={handleRemoveTrack}
          />
        </main>
        <aside className="right-panel">
        <CollectionPanels
          favoriteTracks={favoriteTracks}
          burnedTracks={burnedTracks}
        />

        <HistoryPanel historyTracks={historyTracks} />
      </aside>
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
        onPrevious={handlePrevious}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />
    </div>
  )
}