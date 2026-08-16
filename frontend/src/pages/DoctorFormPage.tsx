import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  const { data: allSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  })

  async function loadDoctor() {
    const doctor = await getDoctor(id!)
    setForm({
      fullName: doctor.fullName,
      licenseNumber: doctor.licenseNumber,
      phoneNumber: doctor.phoneNumber,
      email: doctor.email ?? '',
    })
    setCurrentSpecialties(doctor.specialties ?? [])
    setLoading(false)
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
    try {
      if (isEditing) {
        await updateDoctor(id!, form)
      } else {
        await createDoctor(form)
      }
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      navigate('/doctors')
    } catch {
      setError('Failed to save doctor. Check the fields and try again.')
    }
  }

  async function handleAddSpecialty() {
    if (!selectedSpecialtyId || !id) return
    setSpecialtyMessage(null)
    try {
      await addDoctorSpecialty(id, selectedSpecialtyId)
      setSelectedSpecialtyId('')
      await loadDoctor()
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    } catch {
      setSpecialtyMessage('Failed to add specialty.')
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  const availableToAdd = allSpecialties?.filter((s) => !currentSpecialties.includes(s.name)) ?? []

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            {isEditing ? 'Edit Doctor' : 'New Doctor'}
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
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
              <label className="block text-sm font-medium text-slate-600 mb-1">License Number *</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
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
                {isEditing ? 'Save Changes' : 'Create Doctor'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {isEditing && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Specialties</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {currentSpecialties.length > 0 ? (
                currentSpecialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-sm">No specialties assigned yet</span>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedSpecialtyId}
                onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a specialty...</option>
                {availableToAdd.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSpecialty}
                disabled={!selectedSpecialtyId}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Add
              </button>
            </div>

            {specialtyMessage && (
              <p className="text-red-600 text-sm mt-2">{specialtyMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}