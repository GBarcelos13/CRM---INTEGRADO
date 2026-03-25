'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, Search } from 'lucide-react'
import clsx from 'clsx'
import { type Task, type TaskType, type TaskPriority, type Lead } from '@/lib/mockData'
import { createTask, fetchLeads } from '@/lib/db'

const TYPES: { value: TaskType; label: string }[] = [
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'Email' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'follow_up', label: 'Follow-up' },
]

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

interface NewTaskModalProps {
  defaultTitle?: string
  defaultLeadId?: string
  defaultLeadName?: string
  defaultLeadEmail?: string
  defaultLeadPhone?: string
  onClose: () => void
  onAdd: (task: Task) => void
}

export default function NewTaskModal({
  defaultTitle = '',
  defaultLeadId,
  defaultLeadName,
  defaultLeadEmail,
  defaultLeadPhone,
  onClose,
  onAdd,
}: NewTaskModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const isLeadLocked = !!defaultLeadId

  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadSearch, setLeadSearch] = useState(defaultLeadName ?? '')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    title: defaultTitle,
    type: 'ligacao' as TaskType,
    priority: 'media' as TaskPriority,
    dueDate: today,
    phone: defaultLeadPhone ?? '',
    email: defaultLeadEmail ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeads().then((all) => {
      setLeads(all)
      if (defaultLeadId) {
        const lead = all.find((l) => l.id === defaultLeadId)
        if (lead) setSelectedLead(lead)
      }
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const filteredLeads = leads.filter((l) =>
    leadSearch.trim() === ''
      ? true
      : l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.company.toLowerCase().includes(leadSearch.toLowerCase())
  )

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
    setLeadSearch(lead.name)
    setForm((prev) => ({ ...prev, phone: lead.phone, email: lead.email }))
    setShowDropdown(false)
  }

  const handleClearLead = () => {
    setSelectedLead(null)
    setLeadSearch('')
    setForm((prev) => ({ ...prev, phone: '', email: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setLoading(true)
    setError('')
    try {
      const task = await createTask({
        title: form.title.trim(),
        type: form.type,
        priority: form.priority,
        dueDate: form.dueDate,
        leadId: selectedLead?.id ?? defaultLeadId,
        leadName: selectedLead?.name ?? (leadSearch.trim() || undefined),
        leadEmail: form.email.trim() || undefined,
        leadPhone: form.phone.trim() || undefined,
      })
      onAdd(task)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Nova Tarefa</h2>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Título */}
            <div>
              <label className={labelCls}>Título <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Ex: Ligar para cliente"
                className={inputCls}
                autoFocus
              />
            </div>

            {/* Lead com busca */}
            <div>
              <label className={labelCls}>Lead (opcional)</label>
              <div className="relative" ref={dropdownRef}>
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => {
                    setLeadSearch(e.target.value)
                    setSelectedLead(null)
                    setShowDropdown(true)
                  }}
                  onFocus={() => { if (!isLeadLocked) setShowDropdown(true) }}
                  placeholder="Buscar lead pelo nome ou empresa..."
                  className={`${inputCls} pl-8 ${selectedLead && !isLeadLocked ? 'pr-8' : ''}`}
                  readOnly={isLeadLocked}
                />
                {selectedLead && !isLeadLocked && (
                  <button
                    type="button"
                    onClick={handleClearLead}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}

                {showDropdown && !isLeadLocked && filteredLeads.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredLeads.slice(0, 8).map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onMouseDown={() => handleSelectLead(lead)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 shrink-0">
                          <span className="text-white text-xs font-bold select-none">{lead.avatar}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tipo + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Tipo</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Prioridade</label>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputCls}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Data */}
            <div>
              <label className={labelCls}>Data de vencimento</label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className={inputCls} />
            </div>

            {/* Telefone + Email (preenchidos pelo lead) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={clsx(inputCls, (!!selectedLead || isLeadLocked) && 'bg-slate-50 text-slate-500')}
                  readOnly={!!selectedLead || isLeadLocked}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@empresa.com"
                  className={clsx(inputCls, (!!selectedLead || isLeadLocked) && 'bg-slate-50 text-slate-500')}
                  readOnly={!!selectedLead || isLeadLocked}
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
                <Plus size={15} />
                {loading ? 'Salvando...' : 'Adicionar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
