import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  change?: string
  changePositive?: boolean
  subtitle?: string
}

export default function MetricCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  changePositive,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 leading-none mb-3">{title}</p>
          <p className="text-3xl font-bold text-slate-900 leading-none tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 leading-none">{subtitle}</p>
          )}
          {change && (
            <div
              className={clsx(
                'flex items-center gap-1 mt-3',
                changePositive ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {changePositive ? (
                <TrendingUp size={13} className="shrink-0" />
              ) : (
                <TrendingDown size={13} className="shrink-0" />
              )}
              <span className="text-xs font-medium">{change}</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ml-4 transition-transform duration-200 group-hover:scale-105',
            iconBg
          )}
        >
          <span className={clsx('flex items-center justify-center', iconColor)}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  )
}
