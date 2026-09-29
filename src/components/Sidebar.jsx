import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  ClipboardList,
  Users,
  Building2,
  LogOut,
  MinusCircle
} from 'lucide-react'
import { canAccess, useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Asset Register', icon: Package },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { to: '/assignments', label: 'Assignments', icon: UserCheck },
  { to: '/expenditures', label: 'Expenditures', icon: MinusCircle },
  { to: '/users', label: 'User Directory', icon: Users },
  { to: '/audit-logs', label: 'Audit Trail', icon: ClipboardList }
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
      {/* Brand header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-inner">
          <Building2 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-black tracking-wider uppercase leading-tight text-white">MAMS OPS</div>
          <div className="text-[11px] text-blue-300/80 font-medium">Military Asset System</div>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
        {links
          .filter((link) => canAccess(user?.role, link.to))
          .map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 font-semibold shadow-xs border-l-4 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{link.label}</span>
              </NavLink>
            )
          })}
      </div>

      {/* User info & logout footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="mb-3 px-2">
          <div className="text-xs font-semibold text-slate-800 truncate">{user?.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-[10px] font-bold text-blue-700 uppercase">{user?.role?.replace('_', ' ')}</span>
          </div>
          {user?.baseName && (
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">Base: {user.baseName}</div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
