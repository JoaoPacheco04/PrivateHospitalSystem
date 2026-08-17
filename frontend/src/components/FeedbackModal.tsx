import { useState } from 'react'
import { createPatientFeedback } from '../api/feedbacks'
import { toast } from '../store/toastStore'

export default function FeedbackModal({
  patientId,
  appointmentId,
  doctorName,
  isOpen,
  onClose,
}: {
  patientId: string
  appointmentId?: string
  doctorName?: string
  isOpen: boolean
  onClose: () => void
}) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createPatientFeedback({
        patientId,
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      })
      toast.success('Thank you! Your feedback has been submitted.')
      onClose()
    } catch {
      toast.error('Failed to submit feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3">
            ★
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Rate Your Medical Care</h2>
          <p className="text-xs text-slate-500 mt-1">
            {doctorName ? `How was your consultation with Dr. ${doctorName}?` : 'Please rate the quality of your care.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 focus:outline-none ${
                    active ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              )
            })}
          </div>

          <div className="text-center text-xs font-bold text-slate-600">
            {rating === 5 && 'Excellent (5/5)'}
            {rating === 4 && 'Very Good (4/5)'}
            {rating === 3 && 'Average (3/5)'}
            {rating === 2 && 'Poor (2/5)'}
            {rating === 1 && 'Very Poor (1/5)'}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Feedback & Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about the attention, clarity and care provided..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Skip / Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
