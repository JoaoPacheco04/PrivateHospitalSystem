// ─── Role types ──────────────────────────────────────────────────────────────
export type AppRole = 'Admin' | 'Staff' | 'Doctor' | 'Patient'

// ─── Nav item definition ─────────────────────────────────────────────────────
export interface NavItem {
  path: string
  label: string
  icon: string        // Heroicons SVG path (d attribute)
  group?: string      // optional group heading
}

// SVG path data for Heroicons (outline, 24x24)
const ICONS = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  patients:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  doctors:      'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  appointments: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  invoices:     'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  prescriptions:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  rooms:        'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  exams:        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  admissions:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  surgeries:    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  referrals:    'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8',
  emergency:    'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  medications:  'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  reports:      'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  auditLogs:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  prices:       'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  consents:     'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  profile:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  myAppts:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  myInvoices:   'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
}

// ─── Nav items per role ───────────────────────────────────────────────────────
const ADMIN_NAV: NavItem[] = [
  { path: '/dashboard',        label: 'Dashboard',         icon: ICONS.dashboard,    group: 'Overview' },
  { path: '/reports',          label: 'Reports',           icon: ICONS.reports,      group: 'Overview' },
  { path: '/patients',         label: 'Patients',          icon: ICONS.patients,     group: 'Clinical' },
  { path: '/doctors',          label: 'Doctors',           icon: ICONS.doctors,      group: 'Clinical' },
  { path: '/appointments',     label: 'Appointments',      icon: ICONS.appointments, group: 'Clinical' },
  { path: '/admissions',       label: 'Admissions',        icon: ICONS.admissions,   group: 'Clinical' },
  { path: '/surgeries',        label: 'Surgeries',         icon: ICONS.surgeries,    group: 'Clinical' },
  { path: '/emergency',        label: 'Emergency',         icon: ICONS.emergency,    group: 'Clinical' },
  { path: '/referrals',        label: 'Referrals',         icon: ICONS.referrals,    group: 'Clinical' },
  { path: '/exams',            label: 'Medical Exams',     icon: ICONS.exams,        group: 'Clinical' },
  { path: '/prescriptions',    label: 'Prescriptions',     icon: ICONS.prescriptions,group: 'Clinical' },
  { path: '/consents',         label: 'Informed Consents', icon: ICONS.consents,     group: 'Clinical' },
  { path: '/rooms-beds',       label: 'Rooms & Beds',      icon: ICONS.rooms,        group: 'Facilities' },
  { path: '/medications',          label: 'Medications',       icon: ICONS.medications,  group: 'Facilities' },
  { path: '/procedure-prices',     label: 'Procedure Tariffs', icon: ICONS.prices,       group: 'Finance' },
  { path: '/insurance-providers',  label: 'Insurance & Copay', icon: ICONS.prices,       group: 'Finance' },
  { path: '/invoices',             label: 'Invoices',          icon: ICONS.invoices,     group: 'Finance' },
  { path: '/audit-logs',           label: 'Audit & Security',  icon: ICONS.auditLogs,    group: 'Administration' },
]

const STAFF_NAV: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',         icon: ICONS.dashboard,    group: 'Overview' },
  { path: '/patients',     label: 'Patients',          icon: ICONS.patients,     group: 'Clinical' },
  { path: '/appointments', label: 'Appointments',      icon: ICONS.appointments, group: 'Clinical' },
  { path: '/admissions',   label: 'Admissions',        icon: ICONS.admissions,   group: 'Clinical' },
  { path: '/emergency',    label: 'Emergency',         icon: ICONS.emergency,    group: 'Clinical' },
  { path: '/referrals',    label: 'Referrals',         icon: ICONS.referrals,    group: 'Clinical' },
  { path: '/consents',     label: 'Informed Consents', icon: ICONS.consents,     group: 'Clinical' },
  { path: '/rooms-beds',   label: 'Rooms & Beds',      icon: ICONS.rooms,        group: 'Facilities' },
  { path: '/medications',  label: 'Medications',       icon: ICONS.medications,  group: 'Facilities' },
  { path: '/invoices',     label: 'Invoices',          icon: ICONS.invoices,     group: 'Finance' },
]

const DOCTOR_NAV: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',         icon: ICONS.dashboard,    group: 'Overview' },
  { path: '/patients',     label: 'Patients',          icon: ICONS.patients,     group: 'Clinical' },
  { path: '/appointments', label: 'Appointments',      icon: ICONS.appointments, group: 'Clinical' },
  { path: '/prescriptions',label: 'Prescriptions',     icon: ICONS.prescriptions,group: 'Clinical' },
  { path: '/exams',        label: 'Medical Exams',     icon: ICONS.exams,        group: 'Clinical' },
  { path: '/surgeries',    label: 'Surgeries',         icon: ICONS.surgeries,    group: 'Clinical' },
  { path: '/referrals',    label: 'Referrals',         icon: ICONS.referrals,    group: 'Clinical' },
  { path: '/consents',     label: 'Informed Consents', icon: ICONS.consents,     group: 'Clinical' },
]

const PATIENT_NAV: NavItem[] = [
  { path: '/my-profile',   label: 'My Profile',        icon: ICONS.profile,      group: 'My Health' },
  { path: '/appointments', label: 'My Appointments',   icon: ICONS.myAppts,      group: 'My Health' },
  { path: '/prescriptions',label: 'My Prescriptions',  icon: ICONS.prescriptions,group: 'My Health' },
  { path: '/exams',        label: 'My Exams',          icon: ICONS.exams,        group: 'My Health' },
  { path: '/consents',     label: 'My Consents',       icon: ICONS.consents,     group: 'My Health' },
  { path: '/invoices',     label: 'My Invoices',       icon: ICONS.myInvoices,   group: 'Finance' },
]

export function getNavItems(role: string | null): NavItem[] {
  switch (role) {
    case 'Admin':   return ADMIN_NAV
    case 'Staff':   return STAFF_NAV
    case 'Doctor':  return DOCTOR_NAV
    case 'Patient': return PATIENT_NAV
    default:        return []
  }
}

// ─── Role badges ──────────────────────────────────────────────────────────────
export const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Admin:   { bg: 'bg-violet-500/20', text: 'text-violet-300', label: 'Administrator' },
  Staff:   { bg: 'bg-sky-500/20',    text: 'text-sky-300',    label: 'Staff' },
  Doctor:  { bg: 'bg-emerald-500/20',text: 'text-emerald-300',label: 'Doctor' },
  Patient: { bg: 'bg-amber-500/20',  text: 'text-amber-300',  label: 'Patient' },
}

// ─── Action guards ────────────────────────────────────────────────────────────
export function canCreate(role: string | null, resource: string): boolean {
  if (!role) return false
  if (role === 'Admin') return true
  const staffCreate = ['patients', 'appointments', 'admissions', 'invoices', 'medications', 'referrals', 'emergency', 'rooms']
  const doctorCreate = ['prescriptions', 'exams', 'referrals', 'surgeries']
  const patientCreate = ['appointments']
  switch (role) {
    case 'Staff':   return staffCreate.includes(resource)
    case 'Doctor':  return doctorCreate.includes(resource)
    case 'Patient': return patientCreate.includes(resource)
    default:        return false
  }
}

export function canEdit(role: string | null, resource: string): boolean {
  if (!role) return false
  if (role === 'Admin') return true
  const staffEdit = ['patients', 'appointments', 'admissions', 'invoices', 'medications', 'rooms']
  const doctorEdit = ['prescriptions', 'exams', 'surgeries']
  switch (role) {
    case 'Staff':  return staffEdit.includes(resource)
    case 'Doctor': return doctorEdit.includes(resource)
    default:       return false
  }
}

export function canDelete(role: string | null, _resource: string): boolean {
  return role === 'Admin'
}

// ─── Default route per role ───────────────────────────────────────────────────
export function defaultRouteForRole(role: string | null): string {
  switch (role) {
    case 'Patient': return '/my-profile'
    default:        return '/dashboard'
  }
}

// ─── Routes allowed per role ──────────────────────────────────────────────────
const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  Admin: [
    '/dashboard', '/patients', '/patients/new', '/doctors', '/doctors/new',
    '/appointments', '/appointments/new', '/invoices', '/prescriptions',
    '/rooms-beds', '/exams', '/admissions', '/surgeries', '/referrals',
    '/emergency', '/medications', '/reports', '/audit-logs', '/procedure-prices', '/consents', '/insurance-providers',
  ],
  Staff: [
    '/dashboard', '/patients', '/patients/new', '/appointments', '/appointments/new',
    '/admissions', '/invoices', '/medications', '/rooms-beds', '/referrals', '/emergency', '/consents',
  ],
  Doctor: [
    '/dashboard', '/patients', '/appointments', '/prescriptions',
    '/exams', '/surgeries', '/referrals', '/consents',
  ],
  Patient: [
    '/my-profile', '/appointments', '/appointments/new',
    '/prescriptions', '/exams', '/consents', '/invoices',
  ],
}

export function isRouteAllowed(role: string | null, pathname: string): boolean {
  if (!role) return false
  const allowed = ROLE_ALLOWED_ROUTES[role] ?? []
  // Allow dynamic segments like /patients/:id and /doctors/:id
  return allowed.some((r) => pathname === r || (r.endsWith('/new') ? false : pathname.startsWith(r + '/')))
}
