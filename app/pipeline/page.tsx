'use client'

import { useState, useEffect } from 'react'
import { GanttChart, Plus } from 'lucide-react'
import KanbanBoard from '@/components/KanbanBoard'
import NewLeadModal from '@/components/NewLeadModal'
import {
  type Lead,
  type LeadStatus,
  PIPELINE_COLUMNS,
  formatCurrency,
} from '@/lib/mockData'
import { fetchLeads, updateLeadStatus, deleteLead } from '@/lib/db'

// ─── Pipeline page ─────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus>('novo')

  useEffect(() => {
    fetchLeads().then(setLeads).catch(console.error)
  }, [])

  const activeLeads = leads.filter((l) => l.status !== 'fechado_perdido')
  const totalValue = activeLeads.reduce((sum, l) => sum + l.value, 0)

  const handleLeadMove = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))
    updateLeadStatus(leadId, newStatus).catch(console.error)
  }

  const handleLeadAdd = (lead: Lead) => {
    setLeads((prev) => [...prev, lead])
    setModalOpen(false)
  }

  const handleLeadRemove = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    deleteLead(leadId).catch(console.error)
  }

  const openModal = (status: LeadStatus = 'novo') => {
    setDefaultStatus(status)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
              <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                {activeLeads.length}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Valor total em pipeline:{' '}
              <span className="font-semibold text-slate-900">{formatCurrency(totalValue)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 text-xs">
              <GanttChart size={14} />
              Arrastar para mover leads entre etapas
            </div>
            <button
              onClick={() => openModal('novo')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Novo Lead
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {PIPELINE_COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id)
            const colValue = colLeads.reduce((s, l) => s + l.value, 0)
            return (
              <div key={col.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className={`w-2 h-8 rounded-full shrink-0 ${col.headerColor}`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 leading-none mb-1 truncate">{col.title}</p>
                  <p className="text-lg font-bold text-slate-900 leading-none">{colLeads.length}</p>
                  {colValue > 0 && <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(colValue)}</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Kanban */}
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            initialLeads={activeLeads}
            onLeadMove={handleLeadMove}
            onLeadRemove={handleLeadRemove}
            onAddLead={openModal}
          />
        </div>
      </div>

      {modalOpen && (
        <NewLeadModal
          defaultStatus={defaultStatus}
          onClose={() => setModalOpen(false)}
          onAdd={handleLeadAdd}
        />
      )}
    </>
  )
}
