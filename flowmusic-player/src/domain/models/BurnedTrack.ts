import { Track } from './Track'

export class BurnedTrack {
  public readonly track: Track
  public readonly burnedAt: Date

  constructor(track: Track, burnedAt: Date = new Date()) {
    this.track = track
    this.burnedAt = burnedAt
  }
}