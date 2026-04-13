import { Track } from '../domain/models/Track'

export const seedTracks: Track[] = [
  new Track(
    'track-001',
    'Colors',
    'FlowMusic Studio',
    'Starter Session',
    '00:00',
    '/covers/flow-cover-01.jpg',
    false,
    '/audio/flow-track-01.mp3'
  ),
  new Track(
    'track-002',
    'Feel Me',
    'FlowMusic Studio',
    'Starter Session',
    '00:00',
    '/covers/flow-cover-02.png',
    false,
    '/audio/flow-track-02.mp3'
  ),
  new Track(
    'track-003',
    'Flow Up',
    'FlowMusic Studio',
    'Starter Session',
    '00:00',
    '/covers/flow-cover-03.jpg',
    false,
    '/audio/flow-track-03.mp3'
  )
]