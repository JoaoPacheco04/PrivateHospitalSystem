import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PatientFormPage from './pages/PatientFormPage'
import DoctorsPage from './pages/DoctorsPage'
import DoctorFormPage from './pages/DoctorFormPage'
import AppointmentsPage from './pages/AppointmentsPage'
import AppointmentFormPage from './pages/AppointmentFormPage'
import InvoicesPage from './pages/InvoicesPage'
import PrescriptionsPage from './pages/PrescriptionsPage'
import RoomsBedsPage from './pages/RoomsBedsPage'
import MedicalExamsPage from './pages/MedicalExamsPage'
import AdmissionsPage from './pages/AdmissionsPage'
import SurgeriesPage from './pages/SurgeriesPage'
import ReferralsPage from './pages/ReferralsPage'
import EmergencyCasesPage from './pages/EmergencyCasesPage'
import MedicationsPage from './pages/MedicationsPage'
import ReportsPage from './pages/ReportsPage'
import MyProfilePage from './pages/MyProfilePage'
import ForbiddenPage from './pages/ForbiddenPage'
import AuditLogsPage from './pages/AuditLogsPage'
import ProcedurePricesPage from './pages/ProcedurePricesPage'
import ConsentsPage from './pages/ConsentsPage'
import InsuranceProvidersPage from './pages/InsuranceProvidersPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import Layout from './components/Layout'
import { useAuthStore } from './store/authStore'
import { isRouteAllowed, defaultRouteForRole } from './lib/permissions'
import './App.css'

const queryClient = new QueryClient()

// ─── Auth guard (redirect to login if not authenticated) ──────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// ─── Role guard (redirect to /forbidden if role not allowed) ──
function RoleGuard({ children }: { children: React.ReactNode }) {
  const role     = useAuthStore((s) => s.role)
  const location = useLocation()
  if (!isRouteAllowed(role, location.pathname)) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children}</>
}

// ─── Smart default redirect ───────────────────────────────────
function DefaultRedirect() {
  const role = useAuthStore((s) => s.role)
  return <Navigate to={defaultRouteForRole(role)} replace />
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public & TV Kiosk Screens */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/forbidden"    element={<ForbiddenPage />} />
          <Route path="/waiting-room" element={<WaitingRoomPage />} />

          {/* Protected layout */}
          <Route
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            {/* All protected pages — role-guarded individually */}
            <Route path="/dashboard"        element={<RoleGuard><DashboardPage /></RoleGuard>} />
            <Route path="/my-profile"       element={<RoleGuard><MyProfilePage /></RoleGuard>} />

            {/* Patients */}
            <Route path="/patients"         element={<RoleGuard><PatientsPage /></RoleGuard>} />
            <Route path="/patients/new"     element={<RoleGuard><PatientFormPage /></RoleGuard>} />
            <Route path="/patients/:id"     element={<RoleGuard><PatientFormPage /></RoleGuard>} />

            {/* Doctors */}
            <Route path="/doctors"          element={<RoleGuard><DoctorsPage /></RoleGuard>} />
            <Route path="/doctors/new"      element={<RoleGuard><DoctorFormPage /></RoleGuard>} />
            <Route path="/doctors/:id"      element={<RoleGuard><DoctorFormPage /></RoleGuard>} />

            {/* Clinical */}
            <Route path="/appointments"     element={<RoleGuard><AppointmentsPage /></RoleGuard>} />
            <Route path="/appointments/new" element={<RoleGuard><AppointmentFormPage /></RoleGuard>} />
            <Route path="/prescriptions"    element={<RoleGuard><PrescriptionsPage /></RoleGuard>} />
            <Route path="/exams"            element={<RoleGuard><MedicalExamsPage /></RoleGuard>} />
            <Route path="/consents"         element={<RoleGuard><ConsentsPage /></RoleGuard>} />
            <Route path="/admissions"       element={<RoleGuard><AdmissionsPage /></RoleGuard>} />
            <Route path="/surgeries"        element={<RoleGuard><SurgeriesPage /></RoleGuard>} />
            <Route path="/referrals"        element={<RoleGuard><ReferralsPage /></RoleGuard>} />
            <Route path="/emergency"        element={<RoleGuard><EmergencyCasesPage /></RoleGuard>} />

            {/* Facilities & Finance */}
            <Route path="/rooms-beds"        element={<RoleGuard><RoomsBedsPage /></RoleGuard>} />
            <Route path="/medications"       element={<RoleGuard><MedicationsPage /></RoleGuard>} />
            <Route path="/procedure-prices"  element={<RoleGuard><ProcedurePricesPage /></RoleGuard>} />
            <Route path="/insurance-providers" element={<RoleGuard><InsuranceProvidersPage /></RoleGuard>} />
            <Route path="/invoices"          element={<RoleGuard><InvoicesPage /></RoleGuard>} />
            <Route path="/reports"           element={<RoleGuard><ReportsPage /></RoleGuard>} />
            <Route path="/audit-logs"        element={<RoleGuard><AuditLogsPage /></RoleGuard>} />
          </Route>

          {/* Default redirect — role-aware */}
          <Route path="*" element={<AuthGuard><DefaultRedirect /></AuthGuard>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App