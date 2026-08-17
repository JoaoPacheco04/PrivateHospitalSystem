import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getInsuranceProviders,
  createInsuranceProvider,
  deleteInsuranceProvider,
  getInsuranceCoverages,
  createInsuranceCoverage,
  deleteInsuranceCoverage,
} from '../api/insurance'
import { getProcedurePrices } from '../api/procedurePrices'
import { toast } from '../store/toastStore'
import ConfirmModal from '../components/ConfirmModal'

export default function InsuranceProvidersPage() {
  const [tab, setTab] = useState<'providers' | 'coverages'>('providers')
  const [providerName, setProviderName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Coverage form state
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [coveragePercentage, setCoveragePercentage] = useState<number | ''>(80)

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'provider' | 'coverage'; name: string } | null>(null)

  const queryClient = useQueryClient()

  const { data: providers, isLoading: loadingProviders } = useQuery({
    queryKey: ['insuranceProviders'],
    queryFn: getInsuranceProviders,
  })

  const { data: coverages, isLoading: loadingCoverages } = useQuery({
    queryKey: ['insuranceCoverages'],
    queryFn: getInsuranceCoverages,
  })

  const { data: procedurePrices } = useQuery({
    queryKey: ['procedurePrices'],
    queryFn: getProcedurePrices,
  })

  async function handleCreateProvider(e: React.FormEvent) {
    e.preventDefault()
    if (!providerName.trim()) return
    setIsSubmitting(true)
    try {
      await createInsuranceProvider({
        name: providerName.trim(),
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['insuranceProviders'] })
      setProviderName('')
      setContactEmail('')
      setContactPhone('')
      toast.success('Insurance provider registered successfully!')
    } catch {
      toast.error('Failed to register insurance provider.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateCoverage(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProviderId || !selectedProcedure || coveragePercentage === '') return
    setIsSubmitting(true)
    try {
      await createInsuranceCoverage({
        insuranceProviderId: selectedProviderId,
        procedureType: selectedProcedure,
        coveragePercentage: Number(coveragePercentage),
      })
      queryClient.invalidateQueries({ queryKey: ['insuranceCoverages'] })
      setSelectedProcedure('')
      toast.success('Procedure coverage rule defined successfully!')
    } catch {
      toast.error('Failed to create coverage rule.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'provider') {
        await deleteInsuranceProvider(deleteTarget.id)
        queryClient.invalidateQueries({ queryKey: ['insuranceProviders'] })
        toast.success(`Insurance provider ${deleteTarget.name} removed.`)
      } else {
        await deleteInsuranceCoverage(deleteTarget.id)
        queryClient.invalidateQueries({ queryKey: ['insuranceCoverages'] })
        toast.success('Coverage rule deleted.')
      }
    } catch {
      toast.error('Failed to delete resource.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Insurance Providers & Coverage
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage partner health insurance companies, copay percentages and procedure reimbursement policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setTab('providers')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'providers'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🛡️ Partner Providers ({providers?.length ?? 0})
        </button>
        <button
          onClick={() => setTab('coverages')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'coverages'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          📑 Copay & Coverage Rules ({coverages?.length ?? 0})
        </button>
      </div>

      {tab === 'providers' ? (
        <>
          {/* New Provider Form */}
          <div className="app-card p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Register New Health Insurance Partner
            </h2>

            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Médis, Multicare, AdvanceCare"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="app-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="support@medis.pt"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="+351 210 000 000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="app-input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting || !providerName.trim()} className="btn-primary">
                  {isSubmitting ? 'Registering...' : 'Add Insurance Partner'}
                </button>
              </div>
            </form>
          </div>

          {/* Providers Table */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Active Insurance Companies</h2>
            </div>

            {loadingProviders ? (
              <div className="p-12 text-center text-slate-400">Loading insurance partners...</div>
            ) : !providers || providers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No insurance providers registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Company Name</th>
                      <th className="table-header">Support Email</th>
                      <th className="table-header">Phone Contact</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {providers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="table-cell font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">
                            🛡️
                          </span>
                          <span>{p.name}</span>
                        </td>
                        <td className="table-cell text-slate-600 dark:text-slate-300">{p.contactEmail || '—'}</td>
                        <td className="table-cell text-slate-600 dark:text-slate-300">{p.contactPhone || '—'}</td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => setDeleteTarget({ id: p.id, type: 'provider', name: p.name })}
                            className="h-8 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* New Coverage Rule Form */}
          <div className="app-card p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Define Procedure Coverage Percentage
            </h2>

            <form onSubmit={handleCreateCoverage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Insurance Provider *
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="app-select"
                    required
                  >
                    <option value="">Select insurance...</option>
                    {providers?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Procedure / Service *
                  </label>
                  <select
                    value={selectedProcedure}
                    onChange={(e) => setSelectedProcedure(e.target.value)}
                    className="app-select"
                    required
                  >
                    <option value="">Select procedure...</option>
                    {procedurePrices?.map((pr) => (
                      <option key={pr.id} value={pr.procedureType}>
                        {pr.procedureType} (€{pr.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Coverage Share (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="80"
                    value={coveragePercentage}
                    onChange={(e) => setCoveragePercentage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="app-input font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting || !selectedProviderId || !selectedProcedure} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Define Coverage Rule'}
                </button>
              </div>
            </form>
          </div>

          {/* Coverage Rules Table */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Configured Coverage Rules</h2>
            </div>

            {loadingCoverages ? (
              <div className="p-12 text-center text-slate-400">Loading coverage policies...</div>
            ) : !coverages || coverages.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No coverage rules configured yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Insurance Company</th>
                      <th className="table-header">Procedure Type</th>
                      <th className="table-header">Insurance Share</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {coverages.map((cov) => {
                      const providerNameObj = providers?.find((p) => p.id === cov.insuranceProviderId)?.name || 'Insurance'
                      return (
                        <tr key={cov.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="table-cell font-bold text-slate-900 dark:text-white">{providerNameObj}</td>
                          <td className="table-cell font-semibold text-slate-700 dark:text-slate-300">{cov.procedureType}</td>
                          <td className="table-cell">
                            <span className="font-extrabold text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {cov.coveragePercentage}% Covered
                            </span>
                          </td>
                          <td className="table-cell text-right">
                            <button
                              onClick={() => setDeleteTarget({ id: cov.id, type: 'coverage', name: cov.procedureType })}
                              className="h-8 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all"
                            >
                              Delete Rule
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Insurance Resource?"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
