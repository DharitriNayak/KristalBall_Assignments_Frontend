import { useCallback, useEffect, useState } from 'react'
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Building,
  Tag
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { EQUIPMENT_TYPES, errorMessage } from '../constants'

const emptyForm = {
  assetCode: '',
  name: '',
  equipmentType: 'VEHICLE',
  quantity: 1,
  baseId: '',
  status: 'AVAILABLE'
}

export default function Assets() {
  const { user } = useAuth()
  const canEdit = ['ADMIN', 'BASE_COMMANDER'].includes(user?.role)
  const canDelete = user?.role === 'ADMIN'
  const [bases, setBases] = useState([])
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ baseId: '', equipmentType: '', search: '' })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const [{ data: baseData }, { data }] = await Promise.all([
        api.get('/bases'),
        api.get('/assets', {
          params: {
            baseId: filters.baseId || undefined,
            equipmentType: filters.equipmentType || undefined
          }
        })
      ])
      setBases(baseData)
      setRows(data)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load asset register'))
    }
  }, [filters.baseId, filters.equipmentType])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (user?.role === 'BASE_COMMANDER' && user.baseId) {
      setForm((current) => ({ ...current, baseId: String(user.baseId) }))
      setFilters((current) => ({ ...current, baseId: String(user.baseId) }))
    }
  }, [user?.role, user?.baseId])

  const openNew = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      baseId: user?.baseId ? String(user.baseId) : (bases[0]?.id ? String(bases[0].id) : '')
    })
    setShowModal(true)
  }

  const startEdit = (asset) => {
    setEditingId(asset.id)
    setForm({
      assetCode: asset.assetCode,
      name: asset.name,
      equipmentType: asset.equipmentType,
      quantity: asset.quantity,
      baseId: String(asset.base.id),
      status: asset.status
    })
    setShowModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const payload = {
      assetCode: form.assetCode || null,
      name: form.name,
      equipmentType: form.equipmentType,
      quantity: Number(form.quantity),
      baseId: Number(form.baseId),
      status: form.status
    }
    try {
      if (editingId) {
        await api.put(`/assets/${editingId}`, payload)
        setMessage('Asset updated successfully')
      } else {
        await api.post('/assets', payload)
        setMessage('Asset registered successfully')
      }
      setShowModal(false)
      load()
    } catch (err) {
      setError(errorMessage(err, 'Unable to save asset'))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (asset) => {
    if (!window.confirm(`Delete asset ${asset.name} (${asset.assetCode})?`)) return
    setError('')
    setMessage('')
    try {
      await api.delete(`/assets/${asset.id}`)
      setMessage('Asset deleted')
      load()
    } catch (err) {
      setError(errorMessage(err, 'Unable to delete asset'))
    }
  }

  const filteredRows = rows.filter((r) => {
    if (!filters.search) return true
    const term = filters.search.toLowerCase()
    return (
      r.name?.toLowerCase().includes(term) ||
      r.assetCode?.toLowerCase().includes(term) ||
      r.base?.name?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Asset Register & Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active military inventory across operational bases
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Asset</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search by name, asset code, or base..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
          />
        </div>

        <div>
          <select
            value={filters.baseId}
            disabled={user?.role === 'BASE_COMMANDER'}
            onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800 disabled:opacity-60"
          >
            <option value="">All Military Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.equipmentType}
            onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
          >
            <option value="">All Equipment Types</option>
            {EQUIPMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Base Station</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="py-8 text-center text-slate-400 text-xs">
                    No matching assets in this register
                  </td>
                </tr>
              ) : (
                filteredRows.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                      {asset.assetCode}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{asset.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {asset.equipmentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{asset.base?.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {asset.quantity}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          asset.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {asset.status || 'AVAILABLE'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(asset)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => remove(asset)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">
                {editingId ? 'Edit Asset Record' : 'Register New Military Asset'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asset Code</label>
                  <input
                    placeholder="Auto-generated if blank"
                    value={form.assetCode}
                    onChange={(e) => setForm({ ...form, assetCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asset Name</label>
                <input
                  required
                  placeholder="e.g., Tactical Recon Vehicle"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base</label>
                  <select
                    required
                    disabled={user?.role === 'BASE_COMMANDER'}
                    value={form.baseId}
                    onChange={(e) => setForm({ ...form, baseId: e.target.value })}
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="DEPLOYED">DEPLOYED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="EXPENDED">EXPENDED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase rounded-lg shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Asset' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
