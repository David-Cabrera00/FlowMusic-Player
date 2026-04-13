import { Track } from './Track'

export class PlaylistItem {
  public track: Track
  public previous: PlaylistItem | null = null
  public next: PlaylistItem | null = null

  constructor(track: Track) {
    this.track = track
  }
}