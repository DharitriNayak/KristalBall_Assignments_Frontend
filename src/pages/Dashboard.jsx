import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Filter,
  RotateCcw,
  TrendingUp,
  Package,
  Layers,
  UserCheck,
  MinusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  X,
  Calendar,
  Building,
  Tag
} from 'lucide-react'
import api from '../services/api'
import MetricCard from '../components/MetricCard'
import { useAuth } from '../context/AuthContext'
import { EQUIPMENT_TYPES, errorMessage } from '../constants'

function defaultFilters() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const toInput = (date) => date.toISOString().slice(0, 10)
  return {
    startDate: toInput(firstOfMonth),
    endDate: toInput(today),
    baseId: '',
    equipmentType: ''
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [bases, setBases] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [applied, setApplied] = useState(defaultFilters)
  const [summary, setSummary] = useState(null)
  const [movement, setMovement] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('purchases')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)

  // Prevent stale state updates after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const buildQuery = useCallback((state) => ({
    startDate: state.startDate || undefined,
    endDate: state.endDate || undefined,
    baseId: state.baseId || undefined,
    equipmentType: state.equipmentType || undefined
  }), [])

  const load = useCallback(async (state) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get('/dashboard', { params: buildQuery(state) })
      if (mountedRef.current) setSummary(data)
    } catch (err) {
      if (mountedRef.current) setError(errorMessage(err, 'Unable to load dashboard metrics'))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [buildQuery])

  // Track whether the initial load has run to prevent repeat calls
  const initializedRef = useRef(false)
  const userRole = user?.role
  const userBaseId = user?.baseId

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const initial = defaultFilters()
    if (userRole === 'BASE_COMMANDER' && userBaseId) {
      initial.baseId = String(userBaseId)
    }
    setFilters(initial)
    setApplied(initial)

    api.get('/bases')
      .then(({ data }) => { if (mountedRef.current) setBases(data) })
      .catch((err) => { if (mountedRef.current) setError(errorMessage(err, 'Unable to load bases')) })

    load(initial)
  }, [load, userRole, userBaseId])

  const apply = useCallback(async () => {
    if (loading) return
    setApplied(filters)
    await load(filters)
  }, [loading, filters, load])

  const reset = useCallback(async () => {
    if (loading) return
    const initial = defaultFilters()
    if (userRole === 'BASE_COMMANDER' && userBaseId) {
      initial.baseId = String(userBaseId)
    }
    setFilters(initial)
    setApplied(initial)
    await load(initial)
  }, [loading, userRole, userBaseId, load])

  const openMovement = useCallback(async () => {
    if (modalLoading) return
    setError('')
    setModalLoading(true)
    try {
      const { data } = await api.get('/dashboard/net-movement', { params: buildQuery(applied) })
      if (mountedRef.current) {
        setMovement(data)
        setShowModal(true)
      }
    } catch (err) {
      if (mountedRef.current) setError(errorMessage(err, 'Unable to load movement details'))
    } finally {
      if (mountedRef.current) setModalLoading(false)
    }
  }, [modalLoading, applied, buildQuery])

  const closeModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-emerald-800">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold tracking-tight">Filter Controls</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Live inventory calculation</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> Military Base
            </label>
            <select
              value={filters.baseId}
              disabled={userRole === 'BASE_COMMANDER'}
              onChange={(e) => setFilters((f) => ({ ...f, baseId: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-800 font-medium disabled:opacity-60"
            >
              <option value="">All Bases</option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" /> Equipment Type
            </label>
            <select
              value={filters.equipmentType}
              onChange={(e) => setFilters((f) => ({ ...f, equipmentType: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-800 font-medium"
            >
              <option value="">All Types</option>
              {EQUIPMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={apply}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{loading ? 'Loading...' : 'Apply Filters'}</span>
          </button>
          <button
            onClick={reset}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-28 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Metric Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard
              title="Opening Balance"
              value={summary.openingBalance}
              hint="Inventory count at the start of this period"
              icon={Layers}
              color="blue"
            />
            <MetricCard
              title="Closing Balance"
              value={summary.closingBalance}
              hint="Inventory count at the end of this period"
              icon={Package}
              color="cyan"
            />
            <MetricCard
              title="Net Movement"
              value={summary.netMovement > 0 ? `+${summary.netMovement}` : summary.netMovement}
              hint="Click to see the full breakdown"
              icon={TrendingUp}
              onClick={openMovement}
              color="emerald"
            />
            <MetricCard
              title="Assigned Assets"
              value={summary.assignedAssets}
              hint="Assets currently issued to personnel"
              icon={UserCheck}
              color="violet"
            />
            <MetricCard
              title="Expended Assets"
              value={summary.expendedAssets}
              hint="Assets consumed in operations or training"
              icon={MinusCircle}
              color="rose"
            />
          </div>

          {/* Formula Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                  Net Movement Formula
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Purchases ({summary.purchases}) + Transfer In ({summary.transferIn}) − Transfer Out ({summary.transferOut}) = {summary.netMovement}
                </h3>
              </div>
              <button
                onClick={openMovement}
                disabled={modalLoading}
                className="self-start md:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {modalLoading ? 'Loading...' : 'View Detailed Breakdown'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <div className="text-[11px] text-blue-300/90 uppercase font-semibold">New Purchases</div>
                <div className="text-2xl font-black font-mono mt-1 text-white">+{summary.purchases}</div>
              </div>
              <div>
                <div className="text-[11px] text-cyan-300/90 uppercase font-semibold">Inbound Transfers</div>
                <div className="text-2xl font-black font-mono mt-1 text-cyan-300">+{summary.transferIn}</div>
              </div>
              <div>
                <div className="text-[11px] text-rose-300/90 uppercase font-semibold">Outbound Transfers</div>
                <div className="text-2xl font-black font-mono mt-1 text-rose-300">−{summary.transferOut}</div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-300/90 uppercase font-semibold">Net Change</div>
                <div className="text-2xl font-black font-mono mt-1 text-emerald-300">{summary.netMovement}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Net Movement Drill-down Modal */}
      {showModal && movement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Net Movement — Detailed View</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itemized records for Purchases, Inbound and Outbound Transfers
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 flex gap-2 bg-white">
              <button
                onClick={() => setModalTab('purchases')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'purchases'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Purchases ({movement.purchases?.length ?? 0})</span>
              </button>
              <button
                onClick={() => setModalTab('transferIn')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'transferIn'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-cyan-600" />
                <span>Inbound ({movement.transferIn?.length ?? 0})</span>
              </button>
              <button
                onClick={() => setModalTab('transferOut')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'transferOut'
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Outbound ({movement.transferOut?.length ?? 0})</span>
              </button>
            </div>

            {/* Table Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {modalTab === 'purchases' && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Total Purchased: <strong className="text-emerald-800">{movement.purchasesQuantity}</strong>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Date</th>
                          <th className="py-2.5 px-3.5">Asset Name</th>
                          <th className="py-2.5 px-3.5">Type</th>
                          <th className="py-2.5 px-3.5 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {movement.purchases?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                              No purchases recorded in this period
                            </td>
                          </tr>
                        ) : (
                          movement.purchases?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3.5 text-slate-600">{row.date}</td>
                              <td className="py-2 px-3.5 text-slate-900 font-semibold">{row.assetName}</td>
                              <td className="py-2 px-3.5">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {row.equipmentType}
                                </span>
                              </td>
                              <td className="py-2 px-3.5 text-right font-mono font-bold text-emerald-700">
                                +{row.quantity}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'transferIn' && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Total Inbound: <strong className="text-emerald-800">{movement.transferInQuantity}</strong>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Date</th>
                          <th className="py-2.5 px-3.5">From Base</th>
                          <th className="py-2.5 px-3.5">Asset Name</th>
                          <th className="py-2.5 px-3.5 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {movement.transferIn?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                              No inbound transfers in this period
                            </td>
                          </tr>
                        ) : (
                          movement.transferIn?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3.5 text-slate-600">{row.date}</td>
                              <td className="py-2 px-3.5 text-slate-700 font-medium">{row.fromBase}</td>
                              <td className="py-2 px-3.5 text-slate-900 font-semibold">{row.assetName}</td>
                              <td className="py-2 px-3.5 text-right font-mono font-bold text-emerald-700">
                                +{row.quantity}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'transferOut' && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Total Outbound: <strong className="text-rose-700">{movement.transferOutQuantity}</strong>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Date</th>
                          <th className="py-2.5 px-3.5">To Base</th>
                          <th className="py-2.5 px-3.5">Asset Name</th>
                          <th className="py-2.5 px-3.5 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {movement.transferOut?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                              No outbound transfers in this period
                            </td>
                          </tr>
                        ) : (
                          movement.transferOut?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3.5 text-slate-600">{row.date}</td>
                              <td className="py-2 px-3.5 text-slate-700 font-medium">{row.toBase}</td>
                              <td className="py-2 px-3.5 text-slate-900 font-semibold">{row.assetName}</td>
                              <td className="py-2 px-3.5 text-right font-mono font-bold text-rose-600">
                                −{row.quantity}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
