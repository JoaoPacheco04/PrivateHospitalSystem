import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createDoctor, updateDoctor, getDoctor } from '../api/doctors'
import { getSpecialties, addDoctorSpecialty } from '../api/specialties'
import type { CreateDoctorDto } from '../types/doctor'

const emptyForm: CreateDoctorDto = {
  fullName: '',
  licenseNumber: '',
  phoneNumber: '',
  email: '',
}

export default function DoctorFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CreateDoctorDto>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEditing)
  const [currentSpecialties, setCurrentSpecialties] = useState<string[]>([])
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('')
  const [specialtyMessage, setSpecialtyMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: allSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  })

  async function loadDoctor() {
    try {
      const doctor = await getDoctor(id!)
      setForm({
        fullName: doctor.fullName,
        licenseNumber: doctor.licenseNumber,
        phoneNumber: doctor.phoneNumber,
        email: doctor.email ?? '',
      })
      setCurrentSpecialties(doctor.specialties ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEditing) {
      loadDoctor()
    }
  }, [id, isEditing])

  function handleChange(field: keyof CreateDoctorDto, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateDoctor(id!, form)
      } else {
        await createDoctor(form)
      }
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      navigate('/doctors')
    } catch {
      setError('Failed to save doctor profile. Please verify license number uniqueness.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAddSpecialty() {
    if (!selectedSpecialtyId || !id) return
    setSpecialtyMessage(null)
    try {
      await addDoctorSpecialty(id, selectedSpecialtyId)
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      await loadDoctor()
      setSelectedSpecialtyId('')
      setSpecialtyMessage('Specialty added successfully.')
    } catch {
      setSpecialtyMessage('Failed to attach specialty or doctor already has this specialty.')
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading physician record...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 mb-2">
          ← Back to Doctors Directory
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isEditing ? 'Edit Physician Profile' : 'Register New Medical Doctor'}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {isEditing ? 'Update credentials, contact information and specialties.' : 'Add a licensed physician to the hospital medical staff.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Details Card */}
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🩺</span> Professional Credentials & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Legal Name *</label>
              <input
                type="text"
                placeholder="e.g. Dr. Manuel Ferreira"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Medical License (Ordem dos Médicos) *</label>
              <input
                type="text"
                placeholder="e.g. OM-48912"
                value={form.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Phone Number *</label>
              <input
                type="tel"
                placeholder="+351 912 345 678"
                value={form.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="app-input"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Hospital Email Address</label>
              <input
                type="email"
                placeholder="dr.name@hospital.pt"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
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

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/doctors" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Doctor' : 'Register Doctor'}
          </button>
        </div>
      </form>

      {/* Specialties Management (Only when Editing) */}
      {isEditing && (
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>🔬</span> Clinical Specialties
          </h2>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Currently Assigned Specialties</p>
            {currentSpecialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentSpecialties.map((s) => (
                  <span key={s} className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No specialties currently assigned to this doctor.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Assign New Medical Specialty</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedSpecialtyId}
                onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                className="app-select flex-1"
              >
                <option value="">Select specialty to add...</option>
                {allSpecialties
                  ?.filter((s) => !currentSpecialties.includes(s.name))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddSpecialty}
                disabled={!selectedSpecialtyId}
                className="btn-primary"
              >
                Add Specialty
              </button>
            </div>
            {specialtyMessage && (
              <p className="mt-2 text-xs font-medium text-teal-700">{specialtyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}