import { Track } from '../../domain/models/Track'

interface HistoryPanelProps {
  historyTracks: Track[]
}

export function HistoryPanel({ historyTracks }: HistoryPanelProps) {
  return (
    <section className="history-card">
      <div className="section-header">
        <h3>Historial de reproducción</h3>
        <p>Últimas canciones visitadas dentro del reproductor</p>
      </div>

      {historyTracks.length === 0 ? (
        <p className="empty-state">Todavía no hay actividad de reproducción.</p>
      ) : (
        <div className="history-list">
          {historyTracks.map((track, index) => (
            <article key={track.id} className="history-item">
              <div className="history-step">{index + 1}</div>

              <div className="history-info">
                <h4>{track.title}</h4>
                <p>
                  {track.artist} • {track.album}
                </p>
              </div>

              <span>{track.duration}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}