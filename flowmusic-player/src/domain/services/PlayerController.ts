import { Track } from '../models/Track'
import { FlowPlaylist } from './FlowPlaylist'

export class PlayerController {
  private readonly playlist: FlowPlaylist
  private isPlaying: boolean = false
  private progress: number = 0

  constructor(playlist: FlowPlaylist) {
    this.playlist = playlist
  }

  play(): void {
    if (this.playlist.getCurrentTrack()) {
      this.isPlaying = true
    }
  }

  pause(): void {
    this.isPlaying = false
  }

  next(): Track | null {
    this.progress = 0
    return this.playlist.moveNext()
  }

  previous(): Track | null {
    this.progress = 0
    return this.playlist.movePrevious()
  }

  select(trackId: string): boolean {
    this.progress = 0
    return this.playlist.setCurrentById(trackId)
  }

  getCurrentTrack(): Track | null {
    return this.playlist.getCurrentTrack()
  }

  getPlaylistTracks(): Track[] {
    return this.playlist.toArray()
  }

  isActive(): boolean {
    return this.isPlaying
  }

  getProgress(): number {
    return this.progress
  }

  setProgress(value: number): void {
    if (value >= 0 && value <= 100) {
      this.progress = value
    }
  }
}