import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPrescriptionsByPatient, createPrescription } from '../api/prescriptions'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'

export default function PrescriptionsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [medicationName, setMedicationName] = useState('')
  const [dosage, setDosage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', selectedPatientId],
    queryFn: () => getPrescriptionsByPatient(selectedPatientId),
    enabled: !!selectedPatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatientId || !doctorId || !medicationName || !dosage || !instructions) return
    setError(null)
    try {
      await createPrescription({
        patientId: selectedPatientId,
        doctorId,
        medicationName,
        dosage,
        instructions,
      })
      queryClient.invalidateQueries({ queryKey: ['prescriptions', selectedPatientId] })
      setMedicationName('')
      setDosage('')
      setInstructions('')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Failed to create prescription. Check medication stock.'
      setError(typeof message === 'string' ? message : 'Failed to create prescription.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1">Select Patient</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select a patient...</option>
          {patientsResult?.items.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </div>

      {selectedPatientId && (
        <>
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">New Prescription</h2>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Doctor *</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a doctor...</option>
                {doctors?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Medication *</label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dosage *</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 400mg"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Instructions *</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Create Prescription
            </button>
          </form>

          {isLoading ? (
            <p className="text-slate-500">Loading prescriptions...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-teal-50/60 border-b border-teal-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Medication</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Dosage</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Instructions</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Doctor</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions?.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.medicationName}</td>
                      <td className="px-4 py-3 text-slate-600">{p.dosage}</td>
                      <td className="px-4 py-3 text-slate-600">{p.instructions}</td>
                      <td className="px-4 py-3 text-slate-600">{p.doctorName}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(p.prescribedAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                  {prescriptions?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No prescriptions for this patient yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}