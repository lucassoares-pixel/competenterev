export default function CSPage() {
  return (
    <div className="page-wrap">
      <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>⭐ Customer Success</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 24 }}>Carteira e health scores</p>
      <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Em desenvolvimento</div>
        <div style={{ fontSize: 12 }}>Esta página será implementada na próxima sprint.</div>
      </div>
    </div>
  )
}
