'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import clsx from 'clsx'
import {
  type Lead,
  type LeadStatus,
  type LeadOrigin,
  ORIGIN_CONFIG,
  STATUS_CONFIG,
} from '@/lib/mockData'
import { createLead } from '@/lib/db'

const ORIGINS: LeadOrigin[] = ['instagram', 'linkedin', 'indicacao', 'site', 'whatsapp', 'evento']
const STATUSES: LeadStatus[] = ['novo', 'em_atendimento', 'proposta', 'fechado_ganho']

interface NewLeadModalProps {
  defaultStatus?: LeadStatus
  onClose: () => void
  onAdd: (lead: Lead) => void
}

export default function NewLeadModal({ defaultStatus = 'novo', onClose, onAdd }: NewLeadModalProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    origin: 'site' as LeadOrigin,
    status: defaultStatus,
    value: '',
    assignee: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setLoading(true)
    setError('')
    try {
      const lead = await createLead({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        origin: form.origin,
        status: form.status,
        value: parseFloat(form.value) || 0,
        assignee: form.assignee.trim(),
      })
      onAdd(lead)
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Novo Lead</h2>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nome <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: João Silva" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Empresa</label>
                <input type="text" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Ex: Empresa Ltda" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@empresa.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telefone</label>
                <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(11) 99999-9999" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Origem</label>
                <select value={form.origin} onChange={(e) => set('origin', e.target.value)} className={inputCls}>
                  {ORIGINS.map((o) => <option key={o} value={o}>{ORIGIN_CONFIG[o].label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Etapa</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Valor (R$)</label>
                <input type="number" min="0" value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Responsável</label>
                <input type="text" value={form.assignee} onChange={(e) => set('assignee', e.target.value)} placeholder="Ex: Ana Silva" className={inputCls} />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
                <Plus size={15} />
                {loading ? 'Salvando...' : 'Adicionar Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
