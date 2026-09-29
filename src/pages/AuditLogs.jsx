import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShieldAlert, RefreshCw, Search, Filter, AlertCircle, Clock } from 'lucide-react'
import api from '../services/api'
import { errorMessage, formatDateTime } from '../constants'

export default function AuditLogs() {
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ action: '', search: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get('/audit-logs')
      setRows(data)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load audit logs'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const actions = useMemo(() => [...new Set(rows.map((row) => row.action))].sort(), [rows])

  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filters.action && row.action !== filters.action) return false
      if (!search) return true
      return [row.user?.email, row.entityType, row.endpoint, row.requestMethod]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    })
  }, [rows, filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            Immutable Transaction & API Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every mutating state change is recorded with actor ID, entity, HTTP method and timestamp
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search by officer email, entity, or API endpoint..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
          />
        </div>

        <div>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-800"
          >
            <option value="">All Audit Actions ({actions.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Recorded Events ({visible.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Sorted: Newest First</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Acting Officer</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Loading audit records...' : 'No audit records found matching filters'}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono whitespace-nowrap">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                      {row.user?.email || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {row.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{row.entityType || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          row.requestMethod === 'POST'
                            ? 'bg-blue-100 text-blue-800'
                            : row.requestMethod === 'PUT'
                            ? 'bg-amber-100 text-amber-800'
                            : row.requestMethod === 'DELETE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.requestMethod || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs max-w-xs truncate">
                      {row.endpoint || '—'}
                    </td>
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
