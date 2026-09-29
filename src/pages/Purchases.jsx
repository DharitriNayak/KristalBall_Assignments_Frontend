import { useEffect, useState } from 'react'
import { ShoppingCart, Filter, Plus, Calendar, Building, Tag, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { EQUIPMENT_TYPES, errorMessage } from '../constants'

export default function Purchases() {
  const [bases, setBases] = useState([])
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', baseId: '', equipmentType: '' })
  const [form, setForm] = useState({
    baseId: '',
    equipmentType: 'VEHICLE',
    assetName: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().slice(0, 10),
    cost: '',
    supplier: '',
    description: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      const [{ data: baseData }, { data }] = await Promise.all([
        api.get('/bases'),
        api.get('/purchases', {
          params: {
            ...filters,
            baseId: filters.baseId || undefined,
            equipmentType: filters.equipmentType || undefined
          }
        })
      ])
      setBases(baseData)
      setRows(data)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load purchases'))
    }
  }

  useEffect(() => {
    load()
  }, [filters.startDate, filters.endDate, filters.baseId, filters.equipmentType])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await api.post('/purchases', {
        ...form,
        quantity: Number(form.quantity),
        cost: form.cost ? Number(form.cost) : null,
        baseId: Number(form.baseId)
      })
      setMessage('Asset purchase logged successfully')
      setForm({
        ...form,
        assetName: '',
        quantity: 1,
        cost: '',
        supplier: '',
        description: ''
      })
      load()
    } catch (err) {
      setError(errorMessage(err, 'Unable to record purchase'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          Asset Procurement & Purchases
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Record acquisitions from defense suppliers and track procurement history
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

      {/* Record Purchase Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Record New Purchase
        </h3>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Base</label>
            <select
              required
              value={form.baseId}
              onChange={(e) => setForm({ ...form, baseId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
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
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Equipment Type</label>
            <select
              value={form.equipmentType}
              onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asset Name</label>
            <input
              required
              placeholder="e.g. Field Radio Unit"
              value={form.assetName}
              onChange={(e) => setForm({ ...form, assetName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Purchase Date</label>
            <input
              type="date"
              required
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cost ($)</label>
            <input
              type="number"
              placeholder="Optional"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Supplier / Vendor</label>
            <input
              placeholder="e.g. Defense Gear Corp"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Purchase contract or serial notes"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="col-span-full flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Logging Purchase...' : 'Record Purchase'}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Purchase Logs ({rows.length})
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
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Base</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No purchase records match current filters
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 text-xs">{row.purchaseDate}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{row.asset?.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {row.asset?.equipmentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{row.base?.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      +{row.quantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {row.cost ? `$${Number(row.cost).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.supplier || '—'}</td>
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
