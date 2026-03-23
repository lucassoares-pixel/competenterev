import { useUIStore } from '@/stores'

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast" onClick={() => removeToast(t.id)}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color ?? 'var(--accent-primary)', flexShrink: 0 }} />
          {t.message}
        </div>
      ))}
    </div>
  )
}
