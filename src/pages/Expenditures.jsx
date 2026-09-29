import { useCallback, useEffect, useState } from 'react'
import { Flame, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EQUIPMENT_TYPES, errorMessage, formatDateTime } from '../constants'

export default function Expenditures() {
  const { user } = useAuth()
  const [bases, setBases] = useState([])
  const [rows, setRows] = useState([])
  const [assets, setAssets] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', baseId: '', equipmentType: '' })
  const [form, setForm] = useState({
    assetId: '',
    baseId: '',
    quantity: 1,
    reason: '',
    expendedAt: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const [{ data: baseData }, { data }] = await Promise.all([
        api.get('/bases'),
        api.get('/expenditures', {
          params: {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            baseId: filters.baseId || undefined,
            equipmentType: filters.equipmentType || undefined
          }
        })
      ])
      setBases(baseData)
      setRows(data)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load expenditures'))
    }
  }, [filters.startDate, filters.endDate, filters.baseId, filters.equipmentType])

  const loadAssets = useCallback(async (baseId) => {
    if (!baseId) {
      setAssets([])
      return
    }
    try {
      const { data } = await api.get('/assets', { params: { baseId } })
      setAssets(data)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load assets for expenditure'))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadAssets(form.baseId)
  }, [form.baseId, loadAssets])

  useEffect(() => {
    if (user?.role === 'BASE_COMMANDER' && user.baseId) {
      setForm((current) => ({ ...current, baseId: String(user.baseId) }))
      setFilters((current) => ({ ...current, baseId: String(user.baseId) }))
    }
  }, [user?.role, user?.baseId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const payload = {
      assetId: Number(form.assetId),
      baseId: Number(form.baseId),
      quantity: Number(form.quantity),
      reason: form.reason,
      expendedAt: form.expendedAt ? new Date(form.expendedAt).toISOString() : null
    }
    try {
      await api.post('/expenditures', payload)
      setMessage('Asset consumption / expenditure recorded successfully')
      setForm({ ...form, assetId: '', quantity: 1, reason: '', expendedAt: '' })
      load()
      loadAssets(form.baseId)
    } catch (err) {
      setError(errorMessage(err, 'Unable to record expenditure'))
    } finally {
      setLoading(false)
    }
  }

  const selectedAsset = assets.find((a) => String(a.id) === String(form.assetId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-600" />
          Asset Expenditures & Consumption
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Log ammunition, field supplies, or rations consumed during exercises and operations
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Record Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-rose-600" /> Record Asset Write-Off / Consumption
        </h3>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Command</label>
            <select
              required
              disabled={user?.role === 'BASE_COMMANDER'}
              value={form.baseId}
              onChange={(e) => setForm({ ...form, baseId: e.target.value, assetId: '' })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 disabled:opacity-60"
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asset To Expend</label>
            <select
              required
              disabled={!form.baseId || assets.length === 0}
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 disabled:opacity-60"
            >
              <option value="">Select In-Stock Asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetCode} - Stock: {a.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Quantity {selectedAsset ? `(Max: ${selectedAsset.quantity})` : ''}
            </label>
            <input
              type="number"
              min="1"
              max={selectedAsset?.quantity}
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Expenditure Date</label>
            <input
              type="datetime-local"
              value={form.expendedAt}
              onChange={(e) => setForm({ ...form, expendedAt: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Operational Reason / Incident Description
            </label>
            <input
              required
              placeholder="e.g. Expended during tactical combat simulation exercise"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="col-span-full flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Recording...' : 'Record Expenditure'}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Expenditure Records ({rows.length})
          </h3>

          <div className="flex flex-wrap gap-2 text-xs">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
            />
            <select
              value={filters.baseId}
              disabled={user?.role === 'BASE_COMMANDER'}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={filters.equipmentType}
              onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
            >
              <option value="">All Types</option>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Base</th>
                <th className="py-3 px-4 text-right">Expended Qty</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No expenditure records found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {formatDateTime(row.expendedAt)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 text-xs">{row.asset?.assetCode}</td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{row.asset?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{row.base?.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      -{row.quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{row.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
