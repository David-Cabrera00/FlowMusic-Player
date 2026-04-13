import { BurnedTrack } from '../models/BurnedTrack'
import { Track } from '../models/Track'

export class BurnCollection {
  private burnedTracks: BurnedTrack[] = []

  add(track: Track): void {
    const alreadyExists = this.burnedTracks.some(
      (item) => item.track.id === track.id
    )

    if (!alreadyExists) {
      this.burnedTracks.push(new BurnedTrack(track))
    }
  }

  remove(trackId: string): void {
    this.burnedTracks = this.burnedTracks.filter(
      (item) => item.track.id !== trackId
    )
  }

  getAll(): BurnedTrack[] {
    return [...this.burnedTracks]
  }

  contains(trackId: string): boolean {
    return this.burnedTracks.some((item) => item.track.id === trackId)
  }

  clear(): void {
    this.burnedTracks = []
  }
}