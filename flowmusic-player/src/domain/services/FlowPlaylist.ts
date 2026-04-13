import { PlaylistItem } from '../models/PlaylistItem'
import { Track } from '../models/Track'

export class FlowPlaylist {
  private head: PlaylistItem | null = null
  private tail: PlaylistItem | null = null
  private current: PlaylistItem | null = null
  private length: number = 0

  get size(): number {
    return this.length
  }

  getCurrentTrack(): Track | null {
    return this.current ? this.current.track : null
  }

  getFirstTrack(): Track | null {
    return this.head ? this.head.track : null
  }

  getLastTrack(): Track | null {
    return this.tail ? this.tail.track : null
  }

  addToStart(track: Track): void {
    const item = new PlaylistItem(track)

    if (!this.head) {
      this.head = item
      this.tail = item
      this.current = item
    } else {
      item.next = this.head
      this.head.previous = item
      this.head = item
    }

    this.length++
  }

  addToEnd(track: Track): void {
    const item = new PlaylistItem(track)

    if (!this.tail) {
      this.head = item
      this.tail = item
      this.current = item
    } else {
      item.previous = this.tail
      this.tail.next = item
      this.tail = item
    }

    this.length++
  }

  addAtPosition(track: Track, position: number): boolean {
    if (position < 0 || position > this.length) {
      return false
    }

    if (position === 0) {
      this.addToStart(track)
      return true
    }

    if (position === this.length) {
      this.addToEnd(track)
      return true
    }

    let currentItem = this.head
    let currentIndex = 0

    while (currentItem && currentIndex < position) {
      currentItem = currentItem.next
      currentIndex++
    }

    if (!currentItem || !currentItem.previous) {
      return false
    }

    const newItem = new PlaylistItem(track)
    const previousItem = currentItem.previous

    newItem.previous = previousItem
    newItem.next = currentItem
    previousItem.next = newItem
    currentItem.previous = newItem

    this.length++
    return true
  }

  removeById(trackId: string): boolean {
    let item = this.head

    while (item) {
      if (item.track.id === trackId) {
        if (item.previous) {
          item.previous.next = item.next
        } else {
          this.head = item.next
        }

        if (item.next) {
          item.next.previous = item.previous
        } else {
          this.tail = item.previous
        }

        if (this.current === item) {
          this.current = item.next ?? item.previous ?? null
        }

        this.length--
        return true
      }

      item = item.next
    }

    return false
  }

  moveNext(): Track | null {
    if (this.current?.next) {
      this.current = this.current.next
    }

    return this.getCurrentTrack()
  }

  movePrevious(): Track | null {
    if (this.current?.previous) {
      this.current = this.current.previous
    }

    return this.getCurrentTrack()
  }

  setCurrentById(trackId: string): boolean {
    let item = this.head

    while (item) {
      if (item.track.id === trackId) {
        this.current = item
        return true
      }

      item = item.next
    }

    return false
  }

  toArray(): Track[] {
    const tracks: Track[] = []
    let item = this.head

    while (item) {
      tracks.push(item.track)
      item = item.next
    }

    return tracks
  }

  isEmpty(): boolean {
    return this.length === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this.current = null
    this.length = 0
  }
}