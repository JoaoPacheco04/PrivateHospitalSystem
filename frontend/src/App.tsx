import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Layout from './components/Layout'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientFormPage />} />
            <Route path="/patients/:id" element={<PatientFormPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/new" element={<DoctorFormPage />} />
            <Route path="/doctors/:id" element={<DoctorFormPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/rooms-beds" element={<RoomsBedsPage />} />
            <Route path="/exams" element={<MedicalExamsPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/surgeries" element={<SurgeriesPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/emergency" element={<EmergencyCasesPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App