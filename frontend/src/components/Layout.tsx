import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useLanguageStore } from '../store/languageStore'
import { getNavItems, ROLE_STYLES, type NavItem } from '../lib/permissions'
import NotificationBell from './NotificationBell'
import ToastContainer from './ToastContainer'
import CommandPalette from './CommandPalette'
import CodeRedAlertBanner from './CodeRedAlertBanner'
import InactivityLockModal from './InactivityLockModal'
import ClinicalAiAssistantModal from './ClinicalAiAssistantModal'
import DosageCalculatorModal from './DosageCalculatorModal'

// ─── SVG Icon component ───────────────────────────────────────
function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const navTranslationMap: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/reports': 'nav.reports',
  '/patients': 'nav.patients',
  '/doctors': 'nav.doctors',
  '/appointments': 'nav.appointments',
  '/admissions': 'nav.admissions',
  '/surgeries': 'nav.surgeries',
  '/emergency': 'nav.emergency',
  '/referrals': 'nav.referrals',
  '/exams': 'nav.exams',
  '/prescriptions': 'nav.prescriptions',
  '/consents': 'nav.consents',
  '/rooms-beds': 'nav.rooms',
  '/medications': 'nav.medications',
  '/procedure-prices': 'nav.prices',
  '/insurance-providers': 'nav.insurance',
  '/invoices': 'nav.invoices',
  '/audit-logs': 'nav.auditLogs',
  '/my-profile': 'nav.myProfile',
}

const groupTranslationMap: Record<string, string> = {
  Overview: 'group.overview',
  Clinical: 'group.clinical',
  Facilities: 'group.facilities',
  Finance: 'group.finance',
  Administration: 'group.admin',
  'My Health': 'group.myHealth',
}

// ─── Nav group ────────────────────────────────────────────────
function NavGroup({
  group,
  items,
  currentPath,
  t,
}: {
  group: string
  items: NavItem[]
  currentPath: string
  t: (k: string) => string
}) {
  const groupLabel = groupTranslationMap[group] ? t(groupTranslationMap[group]) : group

  return (
    <div className="mb-4">
      <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
        {groupLabel}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active =
            currentPath === item.path ||
            (item.path !== '/dashboard' && currentPath.startsWith(item.path + '/'))
          const label = navTranslationMap[item.path] ? t(navTranslationMap[item.path]) : item.label
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${
                  active
                    ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }
              `}
            >
              <NavIcon d={item.icon} />
              <span className="flex-1 truncate">{label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-teal-200 shrink-0" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Layout ──────────────────────────────────────────────
export default function Layout() {
  const fullName = useAuthStore((s) => s.fullName)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)
  const { theme, toggleTheme } = useThemeStore()
  const { language, toggleLanguage, t } = useLanguageStore()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)
  const [isDosageOpen, setIsDosageOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const navItems = getNavItems(role)
  const roleStyle = ROLE_STYLES[role ?? ''] ?? { bg: 'bg-slate-700', text: 'text-slate-300', label: role ?? '' }

  // Group nav items
  const groups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? 'General'
    acc[g] = acc[g] ? [...acc[g], item] : [item]
    return acc
  }, {})

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Global keyboard shortcut for Command Palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Breadcrumb segment title
  const currentKey = navTranslationMap[location.pathname]
  const currentTitle = currentKey
    ? t(currentKey)
    : navItems.find((n) => n.path === location.pathname)?.label ||
      location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') ||
      t('nav.dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="flex flex-col w-64 shrink-0 bg-slate-900 border-r border-slate-800 select-none">
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/50 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-white text-base font-bold leading-tight truncate">{t('app.title')}</h1>
            <p className="text-slate-400 text-xs truncate">{t('app.subtitle')}</p>
          </div>
        </div>

        {/* User profile capsule */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-base shrink-0">
              {(fullName ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{fullName ?? 'User'}</p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleStyle.bg} ${roleStyle.text}`}>
                  {roleStyle.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {Object.entries(groups).map(([group, items]) => (
            <NavGroup key={group} group={group} items={items} currentPath={location.pathname} t={t} />
          ))}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('app.signOut')}
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Real-time Code Red Emergency Alert Banner */}
        <CodeRedAlertBanner />

        {/* Top bar */}
        <header className="h-16 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between z-10 transition-colors">
          {/* Left: Breadcrumbs, Quick Search, AI Clinical Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('app.title')}</span>
              <span className="text-slate-400 font-semibold">/</span>
              <span className="text-slate-900 dark:text-white font-bold capitalize">{currentTitle}</span>
            </div>

            {/* Quick Command Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 transition-all"
            >
              <span>🔍</span>
              <span className="hidden md:inline">{t('app.quickSearch')}</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono border border-slate-200 dark:border-slate-700 font-bold">
                Ctrl K
              </kbd>
            </button>

            {/* Clinical Tools Fast Access */}
            {role !== 'Patient' && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="h-8 px-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="AI Clinical Diagnostic Assistant"
                >
                  <span>🤖</span>
                  <span>AI Triage</span>
                </button>
                <button
                  onClick={() => setIsDosageOpen(true)}
                  className="h-8 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Weight-based Dosage Calculator"
                >
                  <span>💊</span>
                  <span>Dosage Calc</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Controls: Language Selector, Theme Toggle, Notifications, Status, Role */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Language Selector Button */}
            <button
              onClick={toggleLanguage}
              title={`Switch to ${language === 'pt' ? 'English' : 'Português'}`}
              className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <span>{language === 'pt' ? '🇵🇹' : '🇬🇧'}</span>
              <span className="uppercase">{language}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 flex items-center justify-center text-base transition-all"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Live Notification Bell */}
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('app.online')}</span>
            </div>

            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
              {roleStyle.label}
            </span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 app-layout-main">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Inactivity Auto-Lock Screen */}
      <InactivityLockModal />

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* AI Clinical Assistant Modal */}
      <ClinicalAiAssistantModal isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />

      {/* Weight-based Dosage Calculator Modal */}
      <DosageCalculatorModal isOpen={isDosageOpen} onClose={() => setIsDosageOpen(false)} />

      {/* Floating Toast Alerts Container */}
      <ToastContainer />
    </div>
  )
}