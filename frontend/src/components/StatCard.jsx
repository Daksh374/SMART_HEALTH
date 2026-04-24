const StatCard = ({ icon, label, value, sub, color = 'green', trend }) => {
  const colors = {
    green:  { bg: 'bg-brand-50  dark:bg-brand-900/20', icon: 'bg-brand-600', text: 'text-brand-600 dark:text-brand-400' },
    blue:   { bg: 'bg-blue-50   dark:bg-blue-900/20',  icon: 'bg-blue-600',  text: 'text-blue-600  dark:text-blue-400'  },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',icon: 'bg-purple-600',text: 'text-purple-600 dark:text-purple-400'},
    amber:  { bg: 'bg-amber-50  dark:bg-amber-900/20', icon: 'bg-amber-500', text: 'text-amber-600  dark:text-amber-400' },
  }
  const c = colors[color] || colors.green

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center text-white text-xl shadow-sm`}>
          {icon}
        </div>
        {trend != null && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0
              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default StatCard
