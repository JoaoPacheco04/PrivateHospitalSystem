import { useQuery } from '@tanstack/react-query'
import { getAppointments } from '../api/appointments'
import { getPrescriptionsByPatient } from '../api/prescriptions'
import { getExamsByPatient } from '../api/medicalExams'

interface TimelineItem {
  id: string
  date: Date
  type: 'appointment' | 'prescription' | 'exam' | 'vital'
  title: string
  subtitle: string
  badge: string
  badgeColor: string
  icon: string
}

export default function PatientTimeline({ patientId }: { patientId: string }) {
  const { data: appts } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  })

  const { data: prescs } = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => getPrescriptionsByPatient(patientId),
    enabled: !!patientId,
  })

  const { data: exams } = useQuery({
    queryKey: ['medicalExams', patientId],
    queryFn: () => getExamsByPatient(patientId),
    enabled: !!patientId,
  })

  const items: TimelineItem[] = [
    ...(appts ?? []).map((a) => ({
      id: `appt-${a.id}`,
      date: new Date(a.scheduledAt),
      type: 'appointment' as const,
      title: `Consultation with Dr. ${a.doctorName}`,
      subtitle: a.roomNumber ? `Room ${a.roomNumber}` : 'General Consultation',
      badge: a.status,
      badgeColor: a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-teal-50 text-teal-700 border-teal-200',
      icon: '🩺',
    })),
    ...(prescs ?? []).map((p) => ({
      id: `presc-${p.id}`,
      date: new Date(p.prescribedAt),
      type: 'prescription' as const,
      title: `Prescription: ${p.medicationName}`,
      subtitle: `${p.dosage} · ${p.instructions || 'Standard dosage'}`,
      badge: 'Prescribed',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: '💊',
    })),
    ...(exams ?? []).map((e) => ({
      id: `exam-${e.id}`,
      date: new Date(e.requestedAt),
      type: 'exam' as const,
      title: `Diagnostic: ${e.examType}`,
      subtitle: e.result ? `Findings: ${e.result}` : 'Awaiting Lab Result',
      badge: e.status,
      badgeColor: e.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
      icon: '🩻',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        No medical history entries on record yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-600 flex items-center justify-center text-xs shadow-sm">
            {item.icon}
          </div>

          {/* Timeline Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</span>
              <span className={`inline-flex items-center self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.subtitle}</p>

            <p className="text-[11px] text-slate-400 font-mono pt-1">
              {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
