import { Track } from '../domain/models/Track'

export const seedTracks: Track[] = [
  new Track(
    'track-001',
    'Luz de Medianoche',
    'Valeria Sound',
    'Noches Claras',
    '3:42',
    'https://picsum.photos/seed/flowmusic1/300/300',
    false,
    ''
  ),
  new Track(
    'track-002',
    'Ritmo Solar',
    'Neon Avenue',
    'City Waves',
    '4:08',
    'https://picsum.photos/seed/flowmusic2/300/300',
    false,
    ''
  ),
  new Track(
    'track-003',
    'Cielo Eléctrico',
    'Blue Motion',
    'Skyline',
    '2:57',
    'https://picsum.photos/seed/flowmusic3/300/300',
    false,
    ''
  )
]