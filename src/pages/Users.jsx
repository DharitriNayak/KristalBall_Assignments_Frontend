import { useCallback, useEffect, useState } from 'react'
import { Users as UsersIcon, UserPlus, Edit2, Trash2, CheckCircle, AlertCircle, Shield, Building } from 'lucide-react'
import api from '../services/api'
import { errorMessage } from '../constants'

const ROLES = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']

const emptyForm = { name: '', email: '', password: '', role: 'LOGISTICS_OFFICER', baseId: '' }

export default function Users() {
  const [rows, setRows] = useState([])
  const [bases, setBases] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const [{ data: userData }, { data: baseData }] = await Promise.all([api.get('/users'), api.get('/bases')])
      setRows(userData)
      setBases(baseData)
    } catch (err) {
      setError(errorMessage(err, 'Unable to load users'))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      baseId: form.baseId ? Number(form.baseId) : null
    }
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, payload)
        setMessage('User updated successfully')
      } else {
        await api.post('/users', payload)
        setMessage('User created successfully')
      }
      setForm(emptyForm)
      setEditingId(null)
      load()
    } catch (err) {
      setError(errorMessage(err, 'Unable to save user'))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user) => {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      baseId: user.baseId ? String(user.baseId) : ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (user) => {
    setError('')
    setMessage('')
    if (!window.confirm(`Remove user ${user.email}? This cannot be undone.`)) return
    try {
      await api.delete(`/users/${user.id}`)
      setMessage(`User ${user.email} removed`)
      load()
    } catch (err) {
      setError(errorMessage(err, 'Unable to remove user'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          User Administration & RBAC
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system officers, access tiers, and military base assignments (Admin Only)
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

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            {editingId ? 'Modify Officer Credentials' : 'Provision New System User'}
          </h3>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              required
              placeholder="e.g. Maj. General Stone"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Official Email</label>
            <input
              type="email"
              required
              placeholder="stone@defense.mil"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Password {editingId ? '(Leave blank to keep current)' : ''}
            </label>
            <input
              type="password"
              required={!editingId}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assigned Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assigned Base</label>
            <select
              value={form.baseId}
              onChange={(e) => setForm({ ...form, baseId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">No Base Assigned (All Bases)</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Processing...' : editingId ? 'Update Officer' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Registered Accounts ({rows.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Base Station</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : u.role === 'BASE_COMMANDER'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-teal-100 text-teal-800 border-teal-200'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.baseName ? (
                      <span className="flex items-center gap-1 text-xs">
                        <Building className="w-3 h-3 text-slate-400" />
                        {u.baseName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">All Bases</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(u)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(u)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
