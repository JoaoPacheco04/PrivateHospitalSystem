import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getNavItems } from '../lib/permissions'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: string
  path: string
  icon: string
}

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const role = useAuthStore((s) => s.role)
  const navigate = useNavigate()

  const navItems = getNavItems(role)

  const commandItems: CommandItem[] = [
    ...navItems.map((n) => ({
      id: n.path,
      title: n.label,
      subtitle: `Go to ${n.label} section`,
      category: n.group || 'Navigation',
      path: n.path,
      icon: '🧭',
    })),
    ...(role === 'Admin' || role === 'Staff'
      ? [
          {
            id: 'new-patient',
            title: 'Register New Patient',
            subtitle: 'Open patient registration form',
            category: 'Quick Action',
            path: '/patients/new',
            icon: '👤',
          },
          {
            id: 'book-appt',
            title: 'Book Consultation',
            subtitle: 'Schedule a new medical appointment',
            category: 'Quick Action',
            path: '/appointments/new',
            icon: '📅',
          },
          {
            id: 'new-doctor',
            title: 'Add Doctor Profile',
            subtitle: 'Register licensed physician',
            category: 'Quick Action',
            path: '/doctors/new',
            icon: '🩺',
          },
        ]
      : []),
    ...(role === 'Doctor'
      ? [
          {
            id: 'my-surgeries',
            title: 'Theatre Operations',
            subtitle: 'Check scheduled surgeries',
            category: 'Doctor Action',
            path: '/surgeries',
            icon: '🩺',
          },
        ]
      : []),
    ...(role === 'Patient'
      ? [
          {
            id: 'patient-book',
            title: 'Book Consultation',
            subtitle: 'Schedule appointment with doctor',
            category: 'Patient Action',
            path: '/appointments/new',
            icon: '📅',
          },
        ]
      : []),
  ]

  const filtered = commandItems.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          // handled by parent or state
        }
      }
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        navigate(filtered[selectedIndex].path)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, navigate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <span className="text-slate-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name or quick action..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
          <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  onClose()
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  selectedIndex === idx
                    ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 ml-2">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Hospital Command Palette</span>
        </div>
      </div>
    </div>
  )
}
