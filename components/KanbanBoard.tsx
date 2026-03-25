'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  type Lead,
  type LeadStatus,
  PIPELINE_COLUMNS,
  ORIGIN_CONFIG,
  isLeadForgotten,
  formatCurrency,
  formatRelativeDate,
} from '@/lib/mockData'
import { GripVertical, Plus, X } from 'lucide-react'

interface KanbanBoardProps {
  initialLeads: Lead[]
  onLeadMove?: (leadId: string, newStatus: LeadStatus) => void
  onLeadRemove?: (leadId: string) => void
  onAddLead?: (status: LeadStatus) => void
}

type ColumnsMap = Record<string, string[]>

function buildInitialColumns(leads: Lead[]): ColumnsMap {
  const map: ColumnsMap = {}
  for (const col of PIPELINE_COLUMNS) map[col.id] = []
  for (const lead of leads) {
    if (map[lead.status] !== undefined) map[lead.status].push(lead.id)
  }
  return map
}

export default function KanbanBoard({ initialLeads, onLeadMove, onLeadRemove, onAddLead }: KanbanBoardProps) {
  const leadsById = Object.fromEntries(initialLeads.map((l) => [l.id, l]))
  const [columns, setColumns] = useState<ColumnsMap>(() => buildInitialColumns(initialLeads))
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  // Sync columns when leads are added/removed externally
  const syncedColumns: ColumnsMap = {}
  for (const col of PIPELINE_COLUMNS) {
    syncedColumns[col.id] = (columns[col.id] ?? []).filter((id) => leadsById[id])
  }
  // Add new leads that aren't in any column yet
  for (const lead of initialLeads) {
    const inAnyCol = Object.values(syncedColumns).some((ids) => ids.includes(lead.id))
    if (!inAnyCol && syncedColumns[lead.status] !== undefined) {
      syncedColumns[lead.status].push(lead.id)
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    setDraggingId(leadId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', leadId)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColId(colId)
  }

  const handleDragLeave = () => setDragOverColId(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    e.preventDefault()
    if (!draggingId) return

    setColumns((prev) => {
      const updated: ColumnsMap = {}
      for (const key of Object.keys(prev)) {
        updated[key] = prev[key].filter((id) => id !== draggingId)
      }
      updated[colId] = [...(updated[colId] ?? []), draggingId]
      return updated
    })

    onLeadMove?.(draggingId, colId as LeadStatus)
    setDraggingId(null)
    setDragOverColId(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverColId(null)
  }

  const handleRemove = (leadId: string) => {
    setColumns((prev) => {
      const updated: ColumnsMap = {}
      for (const key of Object.keys(prev)) {
        updated[key] = prev[key].filter((id) => id !== leadId)
      }
      return updated
    })
    onLeadRemove?.(leadId)
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-thin">
      {PIPELINE_COLUMNS.map((col) => {
        const leadIds = syncedColumns[col.id] ?? []
        const colLeads = leadIds.map((id) => leadsById[id]).filter(Boolean) as Lead[]
        const totalValue = colLeads.reduce((sum, l) => sum + l.value, 0)
        const isOver = dragOverColId === col.id

        return (
          <div
            key={col.id}
            className={clsx(
              'flex flex-col w-72 shrink-0 rounded-xl border-2 transition-all duration-150',
              isOver
                ? 'border-blue-400 bg-blue-50/80 shadow-lg shadow-blue-100'
                : 'border-transparent bg-slate-50'
            )}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column header */}
            <div className="px-4 pt-4 pb-3">
              <div className={clsx('h-1 w-8 rounded-full mb-3', col.headerColor)} />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{col.title}</h3>
                <span className={clsx('inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-bold', col.badgeColor)}>
                  {colLeads.length}
                </span>
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalValue)}</p>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-2 min-h-[80px]">
              {colLeads.map((lead) => (
                <KanbanCard
                  key={lead.id}
                  lead={lead}
                  isDragging={draggingId === lead.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onRemove={handleRemove}
                />
              ))}

              {colLeads.length === 0 && (
                <div
                  className={clsx(
                    'flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-xs text-slate-400 transition-colors duration-150',
                    isOver ? 'border-blue-300 text-blue-400' : 'border-slate-200'
                  )}
                >
                  {isOver ? 'Soltar aqui' : 'Nenhum lead'}
                </div>
              )}
            </div>

            {/* Add button */}
            <div className="px-3 py-3">
              <button
                onClick={() => onAddLead?.(col.id as LeadStatus)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-150"
              >
                <Plus size={13} />
                Adicionar Lead
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface KanbanCardProps {
  lead: Lead
  isDragging: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void
  onDragEnd: () => void
  onRemove: (leadId: string) => void
}

function KanbanCard({ lead, isDragging, onDragStart, onDragEnd, onRemove }: KanbanCardProps) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const forgotten = isLeadForgotten(lead)
  const originCfg = ORIGIN_CONFIG[lead.origin]
  const relativeDate = formatRelativeDate(lead.lastContact)

  return (
    <div
      draggable={!confirmRemove}
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className={clsx(
        'bg-white rounded-lg border border-slate-200 p-3 transition-all duration-150 group select-none',
        confirmRemove
          ? 'cursor-default'
          : 'cursor-grab active:cursor-grabbing',
        isDragging
          ? 'opacity-40 shadow-none rotate-1'
          : 'opacity-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      {confirmRemove ? (
        /* Confirmação de remoção */
        <div className="flex flex-col items-center gap-2 py-1">
          <p className="text-xs font-medium text-slate-700 text-center">Remover este lead?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(lead.id)}
              className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
            >
              Remover
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top row: avatar + name + actions */}
          <div className="flex items-start gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
              <span className="text-white text-xs font-bold select-none">{lead.avatar}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {forgotten && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse-dot" title="Sem contato há mais de 7 dias" />
                )}
                <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{lead.name}</p>
              </div>
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">{lead.company}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <div className="text-slate-300 group-hover:text-slate-400 transition-colors duration-150">
                <GripVertical size={14} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmRemove(true) }}
                className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                title="Remover lead"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Value */}
          <div className="mt-2.5">
            <p className="text-sm font-bold text-slate-800">{formatCurrency(lead.value)}</p>
          </div>

          {/* Bottom: origin + last contact */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium', originCfg.bgColor, originCfg.textColor)}>
              {originCfg.label}
            </span>
            <span className={clsx('text-xs font-medium', forgotten ? 'text-red-500' : 'text-slate-400')}>
              {relativeDate}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
