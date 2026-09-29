import { Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              Operations Console
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Secure inventory tracking, inter-base movements &amp; audit logs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-semibold text-slate-800">{user?.name}</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : user?.role === 'BASE_COMMANDER'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-teal-100 text-teal-800 border-teal-200'
              }`}>
                {user?.role?.replace('_', ' ')}
              </span>
              {user?.baseName && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {user.baseName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
