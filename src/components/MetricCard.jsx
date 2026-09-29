const colorStyles = {
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    hintText: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-500'
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-700 border-blue-100',
    hintText: 'text-blue-700',
    hoverBorder: 'hover:border-blue-500'
  },
  cyan: {
    iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    hintText: 'text-cyan-700',
    hoverBorder: 'hover:border-cyan-500'
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
    hintText: 'text-amber-700',
    hoverBorder: 'hover:border-amber-500'
  },
  violet: {
    iconBg: 'bg-violet-50 text-violet-700 border-violet-100',
    hintText: 'text-violet-700',
    hoverBorder: 'hover:border-violet-500'
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-700 border-rose-100',
    hintText: 'text-rose-700',
    hoverBorder: 'hover:border-rose-500'
  }
}

export default function MetricCard({ title, value, hint, icon: Icon, onClick, color = 'blue' }) {
  const isClickable = Boolean(onClick)
  const style = colorStyles[color] || colorStyles.blue

  return (
    <div
      className={`bg-white border rounded-xl p-5 transition-all duration-200 shadow-sm relative overflow-hidden ${
        isClickable
          ? `cursor-pointer hover:shadow-md ${style.hoverBorder} hover:-translate-y-0.5 border-slate-200`
          : 'border-slate-200'
      }`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">{value ?? 0}</div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {hint && (
        <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-medium ${style.hintText}`}>
          <span>{hint}</span>
          {isClickable && <span className="ml-1 text-slate-400">→</span>}
        </div>
      )}
    </div>
  )
}
