import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getExamsByPatient, createMedicalExam, completeMedicalExam } from '../api/medicalExams'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'

const statusColors: Record<string, string> = {
  Requested: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function MedicalExamsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [examType, setExamType] = useState('')
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })

  const { data: exams, isLoading } = useQuery({
    queryKey: ['medicalExams', selectedPatientId],
    queryFn: () => getExamsByPatient(selectedPatientId),
    enabled: !!selectedPatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatientId || !doctorId || !examType) return
    setError(null)
    try {
      await createMedicalExam({ patientId: selectedPatientId, doctorId, examType })
      queryClient.invalidateQueries({ queryKey: ['medicalExams', selectedPatientId] })
      setExamType('')
    } catch {
      setError('Failed to create exam.')
    }
  }

  async function handleComplete(id: string) {
    const result = resultInputs[id]
    if (!result) return
    await completeMedicalExam(id, result)
    queryClient.invalidateQueries({ queryKey: ['medicalExams', selectedPatientId] })
    setResultInputs((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Medical Exams</h1>
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
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex gap-3 items-end">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Exam Type *</label>
              <input
                type="text"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                placeholder="e.g. Blood Test"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Request Exam
            </button>
          </form>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {isLoading ? (
            <p className="text-slate-500">Loading exams...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-teal-50/60 border-b border-teal-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Exam Type</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Doctor</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Result</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
                  </tr>
                </thead>
                <tbody>
                  {exams?.map((exam) => (
                    <tr key={exam.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{exam.examType}</td>
                      <td className="px-4 py-3 text-slate-600">{exam.doctorName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusColors[exam.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {exam.status === 'Completed' ? (
                          exam.result
                        ) : (
                          <input
                            type="text"
                            placeholder="Enter result..."
                            value={resultInputs[exam.id] ?? ''}
                            onChange={(e) =>
                              setResultInputs((prev) => ({ ...prev, [exam.id]: e.target.value }))
                            }
                            className="border border-slate-300 rounded-lg px-2 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {exam.status !== 'Completed' && (
                          <button
                            onClick={() => handleComplete(exam.id)}
                            disabled={!resultInputs[exam.id]}
                            className="text-teal-600 hover:text-teal-700 disabled:opacity-40 font-medium text-sm"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {exams?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No exams for this patient yet.
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