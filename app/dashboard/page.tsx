'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Phone,
} from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import Chart from '@/components/Chart'
import ActivityFeed from '@/components/ActivityFeed'
import { isLeadForgotten, formatCurrency, formatRelativeDate, type Lead, type Task } from '@/lib/mockData'
import { fetchLeads, fetchTasks } from '@/lib/db'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetchLeads().then(setLeads).catch(console.error)
    fetchTasks().then(setTasks).catch(console.error)
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const totalLeads = leads.length
  const emAndamento = leads.filter((l) => l.status === 'em_atendimento').length
  const conversoes = leads.filter((l) => l.status === 'fechado_ganho').length
  const tarefasHoje = tasks.filter(
    (t) => !t.completed && t.dueDate.startsWith(today)
  ).length

  const forgottenLeads = leads.filter(isLeadForgotten)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now)

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, Gabriel 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs font-medium text-emerald-700">Sistema operacional</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Leads"
          value={totalLeads}
          icon={<Users size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          change="+3 este mês"
          changePositive
          subtitle="Leads ativos na base"
        />
        <MetricCard
          title="Em Andamento"
          value={emAndamento}
          icon={<TrendingUp size={22} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          change="+1 esta semana"
          changePositive
          subtitle="Leads em atendimento ativo"
        />
        <MetricCard
          title="Conversões"
          value={conversoes}
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          change="+12% este mês"
          changePositive
          subtitle={`Total: ${formatCurrency(leads.filter((l) => l.status === 'fechado_ganho').reduce((s, l) => s + l.value, 0))}`}
        />
        <MetricCard
          title="Tarefas Hoje"
          value={tarefasHoje}
          icon={<Calendar size={22} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          subtitle="Pendentes para hoje"
          change={tarefasHoje > 0 ? `${tarefasHoje} pendente${tarefasHoje > 1 ? 's' : ''}` : 'Tudo em dia!'}
          changePositive={tarefasHoje === 0}
        />
      </div>

      {/* Chart + Activity grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Chart />
        </div>
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Leads em risco */}
      {forgottenLeads.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Leads em Risco
            </h2>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {forgottenLeads.length}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100">
              <p className="text-xs font-medium text-red-700">
                Estes leads estão há mais de 7 dias sem contato e podem ser perdidos.
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {forgottenLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 shrink-0">
                    <span className="text-red-700 text-sm font-bold select-none">{lead.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-red-600">
                      {formatRelativeDate(lead.lastContact)}
                    </p>
                    <p className="text-xs text-slate-400">{formatCurrency(lead.value)}</p>
                  </div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors duration-150 shrink-0 whitespace-nowrap"
                  >
                    <Phone size={12} />
                    Contatar Agora
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
