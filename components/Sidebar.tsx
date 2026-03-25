'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GanttChart,
  CheckSquare,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: GanttChart },
  { label: 'Tarefas', href: '/tasks', icon: CheckSquare },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-full w-64 shrink-0"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shrink-0">
          <span className="text-white font-bold text-lg leading-none select-none">M</span>
        </div>
        <div>
          <span className="text-white font-semibold text-base leading-tight tracking-tight">
            MUG CRM
          </span>
          <p className="text-slate-400 text-xs mt-0.5 leading-none">MUG Solutions</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  'transition-colors duration-150 shrink-0',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-white'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors duration-150 cursor-pointer group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 shrink-0">
            <span className="text-white text-xs font-semibold select-none">AS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">Ana Silva</p>
            <p className="text-slate-400 text-xs leading-tight truncate">Vendedora</p>
          </div>
          <button
            className="text-slate-500 hover:text-white transition-colors duration-150 shrink-0"
            aria-label="Configurações"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
