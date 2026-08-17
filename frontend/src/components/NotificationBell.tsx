import { useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  getAdminNotifications,
  getDoctorNotifications,
  getPatientNotifications,
  markNotificationAsRead,
} from '../api/notifications'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const doctorId = useAuthStore((s) => s.doctorId)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', role, patientId, doctorId],
    queryFn: async () => {
      if (role === 'Admin' || role === 'Staff') {
        return getAdminNotifications()
      } else if (role === 'Doctor' && doctorId) {
        return getDoctorNotifications(doctorId)
      } else if (role === 'Patient' && patientId) {
        return getPatientNotifications(patientId)
      }
      return []
    },
    refetchInterval: 25000,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleMarkRead(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await markNotificationAsRead(id)
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Real-time alerts</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                    !n.isRead ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !n.isRead ? 'bg-teal-500 ring-4 ring-teal-500/20' : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 px-2 py-1 bg-white border border-teal-200 rounded-md hover:bg-teal-50 shrink-0"
                    >
                      Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
