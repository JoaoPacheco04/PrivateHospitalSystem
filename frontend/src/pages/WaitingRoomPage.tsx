import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAppointments } from '../api/appointments'
import { getEmergencyQueue } from '../api/emergencyCases'
import { useLanguageStore } from '../store/languageStore'

// Web Audio API Synthesized Hospital Chime (Ding-Dong)
function playHospitalChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    // High Bell (F5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(698.46, ctx.currentTime) // F5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.8)

    // Low Bell (C5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.35) // C5
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.35)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.35)
    osc2.stop(ctx.currentTime + 1.2)
  } catch {
    // AudioContext blocked by browser autoplay policy until user interaction
  }
}

export default function WaitingRoomPage() {
  const t = useLanguageStore((s) => s.t)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [calledTicket, setCalledTicket] = useState<{
    ticketNumber: string
    patientName: string
    room: string
    doctor: string
  }>({
    ticketNumber: 'A-104',
    patientName: 'Maria Francisca Santos',
    room: 'Consultation Room 102',
    doctor: 'Dr. Carlos Costa',
  })

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    refetchInterval: 8000,
  })

  const { data: erQueue } = useQuery({
    queryKey: ['emergencyQueue'],
    queryFn: getEmergencyQueue,
    refetchInterval: 8000,
  })

  const scheduledToday = appointments?.filter((a) => a.status === 'Scheduled').slice(0, 6) ?? []

  function triggerSimulatedCall(patientName: string, room: string, doctor: string, ticket: string) {
    setCalledTicket({ patientName, room, doctor, ticketNumber: ticket })
    playHospitalChime()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-teal-900/50">
            🏥
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">PRIVATE HOSPITAL</h1>
            <p className="text-sm font-semibold text-teal-400 tracking-wider uppercase">
              Outpatient Waiting Lounge & Calling Display
            </p>
          </div>
        </div>

        {/* Live Clock & Chime Trigger */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => playHospitalChime()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-teal-300 transition-all flex items-center gap-2"
          >
            <span>🔊</span>
            <span>Test Chime</span>
          </button>

          <div className="text-right">
            <p className="text-3xl font-black font-mono tracking-tight text-white">
              {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Calling Spotlight */}
      <div className="my-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left 2 Cols: Active Called Patient Screen */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-8 sm:p-12 rounded-3xl border-2 border-teal-500/50 shadow-2xl shadow-teal-950/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">📢</div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-sm font-bold uppercase tracking-widest animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              NOW CALLING / A CHAMAR
            </div>

            <div className="mt-6">
              <span className="font-mono text-7xl sm:text-8xl font-black text-teal-400 tracking-tight drop-shadow-md">
                {calledTicket.ticketNumber}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
                {calledTicket.patientName}
              </h2>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Please proceed to:</p>
              <p className="text-2xl font-black text-white mt-0.5">{calledTicket.room}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Attending Physician:</p>
              <p className="text-xl font-bold text-teal-300 mt-0.5">{calledTicket.doctor}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Up Next Queue Roster */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Up Next in Line</span>
              <span className="text-xs font-mono text-slate-400 font-normal">Next 5</span>
            </h3>

            <div className="space-y-3">
              {scheduledToday.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No more patients scheduled in outpatient queue.</p>
              ) : (
                scheduledToday.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => triggerSimulatedCall(item.patientName, `Room ${item.roomNumber || '101'}`, `Dr. ${item.doctorName}`, `A-${105 + idx}`)}
                    className="p-3.5 bg-slate-950/80 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                    title="Click to simulate calling this patient"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-400">A-{105 + idx}</span>
                      <p className="text-sm font-bold text-slate-200 group-hover:text-white leading-tight mt-0.5">
                        {item.patientName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {new Date(item.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">Room {item.roomNumber || '101'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ER Queue: <strong className="text-rose-400">{erQueue?.length ?? 0} active</strong></span>
            <span className="text-teal-400 font-bold">⚡ Real-time synced</span>
          </div>
        </div>
      </div>

      {/* Bottom News Ticker / Hospital Info */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-300">HOSPITAL SERVICE STATUS:</span>
          <span>All consultation rooms and triage emergency suites operating on regular schedule.</span>
        </div>
        <div className="font-mono text-slate-500">
          Private Hospital Information System · v2.4
        </div>
      </div>
    </div>
  )
}
