import { BurnedTrack } from '../../domain/models/BurnedTrack'
import { Track } from '../../domain/models/Track'

interface CollectionPanelsProps {
  favoriteTracks: Track[]
  burnedTracks: BurnedTrack[]
}

export function CollectionPanels({
  favoriteTracks,
  burnedTracks
}: CollectionPanelsProps) {
  return (
    <section className="collections-grid">
      <article className="collection-card">
        <div className="section-header">
          <h3>Favoritas</h3>
          <p>Canciones marcadas por el usuario</p>
        </div>

        {favoriteTracks.length === 0 ? (
          <p className="empty-state">Aún no has marcado canciones favoritas.</p>
        ) : (
          <div className="mini-list">
            {favoriteTracks.map((track) => (
              <div key={track.id} className="mini-card">
                <div className="mini-avatar">{track.title.charAt(0)}</div>

                <div className="mini-info">
                  <h4>{track.title}</h4>
                  <p>
                    {track.artist} • {track.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="collection-card">
        <div className="section-header">
          <h3>Quemadas</h3>
          <p>Colección especial del sistema</p>
        </div>

        {burnedTracks.length === 0 ? (
          <p className="empty-state">Aún no has quemado canciones.</p>
        ) : (
          <div className="mini-list">
            {burnedTracks.map((item) => (
              <div key={item.track.id} className="mini-card">
                <div className="mini-avatar">{item.track.title.charAt(0)}</div>

                <div className="mini-info">
                  <h4>{item.track.title}</h4>
                  <p>
                    {item.track.artist} •{' '}
                    {item.burnedAt.toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}