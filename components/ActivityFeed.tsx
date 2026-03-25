import { recentActivities, type RecentActivity } from '@/lib/mockData'
import { Phone, Mail, Users, FileText, MessageCircle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: CheckCircle,
  whatsapp: MessageCircle,
} as const

const typeColors: Record<RecentActivity['color'], string> = {
  green: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  amber: 'bg-amber-100 text-amber-600',
}

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Atividades Recentes</h3>
        <p className="text-sm text-slate-500 mt-0.5">Últimas interações com leads</p>
      </div>

      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />

        <ul className="space-y-5">
          {recentActivities.map((activity) => {
            const Icon = typeIcons[activity.type] ?? FileText
            const colorClass = typeColors[activity.color] ?? typeColors.blue

            return (
              <li key={activity.id} className="flex items-start gap-3 pl-0">
                {/* Icon circle — sits on the timeline */}
                <div
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full shrink-0 relative z-10',
                    colorClass
                  )}
                >
                  <Icon size={14} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-slate-700 leading-snug">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
