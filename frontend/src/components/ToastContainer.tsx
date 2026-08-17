import { useToastStore, type ToastType } from '../store/toastStore'

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-900/95',
    border: 'border-emerald-500/30',
    text: 'text-white',
    icon: '✓',
  },
  error: {
    bg: 'bg-rose-900/95',
    border: 'border-rose-500/30',
    text: 'text-white',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-900/95',
    border: 'border-amber-500/30',
    text: 'text-white',
    icon: '⚠',
  },
  info: {
    bg: 'bg-slate-900/95',
    border: 'border-teal-500/30',
    text: 'text-white',
    icon: 'ℹ',
  },
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const style = toastStyles[t.type]
        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md
              ${style.bg} ${style.border} ${style.text} animate-fade-in
            `}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                {style.icon}
              </span>
              <p className="text-sm font-semibold leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
