'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Phone, Mail, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import {
  type Lead,
  type LeadStatus,
  STATUS_CONFIG,
  ORIGIN_CONFIG,
  isLeadForgotten,
  formatCurrency,
  formatRelativeDate,
} from '@/lib/mockData'
import { fetchLeads, updateLeadStatus } from '@/lib/db'
import LeadSidebar from '@/components/LeadSidebar'
import NewLeadModal from '@/components/NewLeadModal'

type FilterValue = 'todos' | LeadStatus
type SortValue = 'recente' | 'valor' | 'nome'

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Novo', value: 'novo' },
  { label: 'Em Atendimento', value: 'em_atendimento' },
  { label: 'Proposta', value: 'proposta' },
  { label: 'Fechado ✓', value: 'fechado_ganho' },
  { label: 'Fechado ✗', value: 'fechado_perdido' },
]

const sortOptions: { label: string; value: SortValue }[] = [
  { label: 'Mais recente', value: 'recente' },
  { label: 'Maior valor', value: 'valor' },
  { label: 'Nome A-Z', value: 'nome' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('todos')
  const [sort, setSort] = useState<SortValue>('recente')
  const [sortOpen, setSortOpen] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)

  useEffect(() => {
    fetchLeads().then(setLeads).catch(console.error)
  }, [])

  const handleLeadAdd = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
    setLeadModalOpen(false)
  }

  const filteredLeads = useMemo(() => {
    let result = [...leads]

    if (filter !== 'todos') {
      result = result.filter((l) => l.status === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      )
    }

    if (sort === 'recente') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (sort === 'valor') {
      result.sort((a, b) => b.value - a.value)
    } else if (sort === 'nome') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    }

    return result
  }, [leads, search, filter, sort])

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    )
    setSelectedLead((prev) =>
      prev && prev.id === leadId ? { ...prev, status: newStatus } : prev
    )
    updateLeadStatus(leadId, newStatus).catch(console.error)
  }

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? 'Ordenar'

  return (
    <>
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              {leads.length}
            </span>
          </div>
          <button onClick={() => setLeadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm">
            <Plus size={16} />
            Novo Lead
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por nome, empresa ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
                  filter === opt.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-150 whitespace-nowrap"
            >
              {sortLabel}
              <ChevronDown size={14} className={clsx('transition-transform duration-150', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false) }}
                    className={clsx(
                      'w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors duration-100',
                      sort === opt.value ? 'text-blue-600 font-medium' : 'text-slate-700'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Lead</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Origem</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Valor</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Responsável</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Último Contato</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                      {leads.length === 0 ? 'Carregando leads...' : 'Nenhum lead encontrado com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const forgotten = isLeadForgotten(lead)
                    const statusCfg = STATUS_CONFIG[lead.status]
                    const originCfg = ORIGIN_CONFIG[lead.origin]
                    const relDate = formatRelativeDate(lead.lastContact)

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleRowClick(lead)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors duration-100 group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shrink-0">
                              <span className="text-white text-xs font-bold select-none">{lead.avatar}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {forgotten && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse-dot"
                                    title="Sem contato há mais de 7 dias"
                                  />
                                )}
                                <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{lead.name}</p>
                              </div>
                              <p className="text-xs text-slate-500 leading-tight truncate mt-0.5">{lead.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', statusCfg.bgColor, statusCfg.textColor)}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', originCfg.bgColor, originCfg.textColor)}>
                            {originCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(lead.value)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-slate-700 whitespace-nowrap">{lead.assignee}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={clsx('text-sm font-medium whitespace-nowrap', forgotten ? 'text-red-500' : 'text-slate-600')}>
                            {relDate}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div
                            className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-150"
                              title={`Ligar para ${lead.name}`}
                            >
                              <Phone size={13} />
                            </a>
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150"
                              title={`Email para ${lead.name}`}
                            >
                              <Mail size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredLeads.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Exibindo{' '}
                <span className="font-semibold text-slate-700">{filteredLeads.length}</span>{' '}
                de{' '}
                <span className="font-semibold text-slate-700">{leads.length}</span> leads
              </p>
            </div>
          )}
        </div>
      </div>

      <LeadSidebar
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />

      {leadModalOpen && (
        <NewLeadModal
          onClose={() => setLeadModalOpen(false)}
          onAdd={handleLeadAdd}
        />
      )}
    </>
  )
}
