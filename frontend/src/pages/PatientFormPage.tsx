import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  function handleChange(field: keyof CreatePatientDto, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      ...form,
      insuranceProviderId: form.insuranceProviderId || undefined,
    }
    try {
      if (isEditing) {
        await updatePatient(id!, payload)
      } else {
        await createPatient(payload)
      }
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      navigate('/patients')
    } catch {
      setError('Failed to save patient. Check the fields and try again.')
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? 'Edit Patient' : 'New Patient'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select...</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">NIF</label>
              <input
                type="text"
                value={form.nif}
                onChange={(e) => handleChange('nif', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Insurance Provider</label>
              <select
                value={form.insuranceProviderId}
                onChange={(e) => handleChange('insuranceProviderId', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None</option>
                {insuranceProviders?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Policy Number</label>
              <input
                type="text"
                value={form.policyNumber}
                onChange={(e) => handleChange('policyNumber', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Address *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={form.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Allergies</label>
            <textarea
              value={form.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={2}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Patient'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}