import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createPatient, updatePatient, getPatient } from '../api/patients'
import { getInsuranceProviders } from '../api/insurance'
import type { CreatePatientDto } from '../types/patient'

const emptyForm: CreatePatientDto = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  email: '',
  address: '',
  nif: '',
  healthNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
  medicalNotes: '',
  insuranceProviderId: '',
  policyNumber: '',
}

export default function PatientFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreatePatientDto>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: insuranceProviders } = useQuery({
    queryKey: ['insuranceProviders'],
    queryFn: getInsuranceProviders,
  })

  useEffect(() => {
    if (isEditing) {
      getPatient(id!).then((patient) => {
        setForm({
          fullName: patient.fullName,
          dateOfBirth: patient.dateOfBirth.split('T')[0],
          gender: patient.gender,
          phoneNumber: patient.phoneNumber,
          email: patient.email ?? '',
          address: patient.address,
          nif: patient.nif ?? '',
          healthNumber: patient.healthNumber ?? '',
          emergencyContactName: patient.emergencyContactName ?? '',
          emergencyContactPhone: patient.emergencyContactPhone ?? '',
          allergies: patient.allergies ?? '',
          medicalNotes: patient.medicalNotes ?? '',
          insuranceProviderId: patient.insuranceProviderId ?? '',
          policyNumber: patient.policyNumber ?? '',
        })
        setLoading(false)
      })
    }
  }, [id, isEditing])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const payload: CreatePatientDto = {
        ...form,
        email: form.email || undefined,
        nif: form.nif || undefined,
        healthNumber: form.healthNumber || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        allergies: form.allergies || undefined,
        medicalNotes: form.medicalNotes || undefined,
        insuranceProviderId: form.insuranceProviderId || undefined,
        policyNumber: form.policyNumber || undefined,
      }

      if (isEditing) {
        await updatePatient(id!, payload)
      } else {
        await createPatient(payload)
      }
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      navigate('/patients')
    } catch {
      setError('Failed to save patient. Please verify all mandatory fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading patient record...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 mb-2">
            ← Back to Patients List
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Patient File' : 'New Patient Registration'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEditing ? 'Update clinical information, contact details and insurance plan.' : 'Register a new patient into the hospital management system.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Identity */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>👤</span> Personal & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Legal Name *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Maria Santos Silva"
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="app-select" required>
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="+351 912 345 678"
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="patient@email.com"
                className="app-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Residential Address *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address, Postal code, City"
                className="app-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identifiers & Healthcare IDs */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🪪</span> Official Identifiers & Healthcare Numbers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Tax ID (NIF)</label>
              <input
                type="text"
                name="nif"
                value={form.nif}
                onChange={handleChange}
                placeholder="e.g. 123456789"
                className="app-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">National Health Number (SNS)</label>
              <input
                type="text"
                name="healthNumber"
                value={form.healthNumber}
                onChange={handleChange}
                placeholder="e.g. 987654321"
                className="app-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🚨</span> Emergency Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="e.g. Spouse, Parent, Sibling"
                className="app-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Emergency Phone</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+351 912 345 678"
                className="app-input"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Clinical Allergies & Notes */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>📋</span> Clinical Notes & Known Allergies
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Known Allergies</label>
              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Latex, NSAIDs"
                className="app-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Medical History & Relevant Notes</label>
              <textarea
                name="medicalNotes"
                rows={3}
                value={form.medicalNotes}
                onChange={handleChange}
                placeholder="e.g. Hypertension, previous surgeries, chronic conditions..."
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Insurance Coverage */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🛡️</span> Health Insurance Coverage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Insurance Provider</label>
              <select
                name="insuranceProviderId"
                value={form.insuranceProviderId}
                onChange={handleChange}
                className="app-select"
              >
                <option value="">No Insurance (Self-Pay)</option>
                {insuranceProviders?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Policy / Member Number</label>
              <input
                type="text"
                name="policyNumber"
                value={form.policyNumber}
                onChange={handleChange}
                placeholder="e.g. POL-893421"
                className="app-input"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/patients" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving Patient File...' : isEditing ? 'Save Changes' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}