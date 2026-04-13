export class Track {
  public readonly id: string
  public title: string
  public artist: string
  public album: string
  public duration: string
  public cover: string
  public isFavorite: boolean
  public audioSrc: string

  constructor(
    id: string,
    title: string,
    artist: string,
    album: string,
    duration: string,
    cover: string,
    isFavorite: boolean = false,
    audioSrc: string = ''
  ) {
    this.id = id
    this.title = title
    this.artist = artist
    this.album = album
    this.duration = duration
    this.cover = cover
    this.isFavorite = isFavorite
    this.audioSrc = audioSrc
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite
  }

  hasAudioSource(): boolean {
    return this.audioSrc.trim().length > 0
  }
}