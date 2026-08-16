import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const fullName = useAuthStore((state) => state.fullName)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/invoices', label: 'Invoices' },
    { path: '/prescriptions', label: 'Prescriptions' },
    { path: '/rooms-beds', label: 'Rooms & Beds' },
    { path: '/exams', label: 'Medical Exams' },
    { path: '/admissions', label: 'Admissions' },
    { path: '/surgeries', label: 'Surgeries' },
    { path: '/referrals', label: 'Referrals' },
    { path: '/emergency', label: 'Emergency Cases' },
    { path: '/medications', label: 'Medications' },
    { path: '/reports', label: 'Reports' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-bold text-lg">Hospital System</h2>
          <p className="text-sm text-slate-400 mt-1">{fullName}</p>
          <p className="text-xs text-teal-400">{role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}