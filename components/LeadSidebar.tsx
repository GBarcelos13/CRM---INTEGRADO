'use client'

import { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  Users,
  FileText,
  MessageCircle,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
  Building2,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react'
import clsx from 'clsx'
import {
  type Lead,
  type LeadStatus,
  type Task,
  STATUS_CONFIG,
  ORIGIN_CONFIG,
  isLeadForgotten,
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from '@/lib/mockData'
import NewTaskModal from '@/components/NewTaskModal'

interface LeadSidebarProps {
  lead: Lead | null
  onClose: () => void
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
}

const interactionIcons = {
  call: { icon: Phone, colorClass: 'bg-emerald-100 text-emerald-600' },
  email: { icon: Mail, colorClass: 'bg-blue-100 text-blue-600' },
  meeting: { icon: Users, colorClass: 'bg-purple-100 text-purple-600' },
  note: { icon: FileText, colorClass: 'bg-slate-100 text-slate-600' },
  whatsapp: { icon: MessageCircle, colorClass: 'bg-green-100 text-green-600' },
} as const

const interactionTypeLabels = {
  call: 'Ligação',
  email: 'Email',
  meeting: 'Reunião',
  note: 'Nota',
  whatsapp: 'WhatsApp',
}

function getNextAction(status: LeadStatus): string {
  switch (status) {
    case 'novo':
      return 'Fazer ligação de qualificação'
    case 'em_atendimento':
      return 'Enviar material ou proposta'
    case 'proposta':
      return 'Ligar para fechar negócio'
    case 'fechado_ganho':
      return 'Iniciar onboarding'
    case 'fechado_perdido':
      return 'Registrar motivo da perda e arquivar'
    default:
      return 'Definir próxima ação'
  }
}

function getNextStatus(current: LeadStatus): LeadStatus | null {
  const flow: LeadStatus[] = ['novo', 'em_atendimento', 'proposta', 'fechado_ganho']
  const idx = flow.indexOf(current)
  if (idx === -1 || idx === flow.length - 1) return null
  return flow[idx + 1]
}

export default function LeadSidebar({ lead, onClose, onStatusChange }: LeadSidebarProps) {
  const [taskModal, setTaskModal] = useState<{ open: boolean; title?: string }>({ open: false })

  if (!lead) return null

  const forgotten = isLeadForgotten(lead)
  const statusCfg = STATUS_CONFIG[lead.status]
  const originCfg = ORIGIN_CONFIG[lead.origin]
  const nextAction = getNextAction(lead.status)
  const nextStatus = getNextStatus(lead.status)

  const sortedInteractions = [...lead.interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
          {/* Avatar */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shrink-0">
            <span className="text-white font-bold text-lg select-none">{lead.avatar}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{lead.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 size={12} className="text-slate-400 shrink-0" />
              <p className="text-sm text-slate-500 truncate">{lead.company}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  statusCfg.bgColor,
                  statusCfg.textColor
                )}
              >
                {statusCfg.label}
              </span>
              <span
                className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  originCfg.bgColor,
                  originCfg.textColor
                )}
              >
                {originCfg.label}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 shrink-0 mt-0.5"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Forgotten warning */}
        {forgotten && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 border-b border-red-100">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs font-medium text-red-700">
              Lead sem contato há mais de 7 dias — entre em contato agora!
            </p>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-6">
            {/* Contact info */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Informações de Contato
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 shrink-0">
                    <Mail size={13} className="text-slate-500" />
                  </div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-blue-600 hover:underline truncate"
                  >
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 shrink-0">
                    <Phone size={13} className="text-slate-500" />
                  </div>
                  <a href={`tel:${lead.phone}`} className="text-sm text-slate-700">
                    {lead.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 shrink-0">
                    <Calendar size={13} className="text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-700">
                    Último contato:{' '}
                    <span
                      className={clsx(
                        'font-medium',
                        forgotten ? 'text-red-600' : 'text-slate-900'
                      )}
                    >
                      {formatRelativeDate(lead.lastContact)}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* Value / Assignee */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Negócio
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5">
                  <DollarSign size={15} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Valor</p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(lead.value)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5">
                  <User size={15} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Responsável</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {lead.assignee}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Lead criado em {formatDate(lead.createdAt)}
              </p>
              {lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Action buttons */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Ações Rápidas
              </h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors duration-150"
                >
                  <Phone size={13} />
                  Ligar
                </a>
                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(lead.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors duration-150"
                >
                  <Mail size={13} />
                  Email
                </a>
                <button
                  onClick={() => setTaskModal({ open: true })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors duration-150"
                >
                  <CheckSquare size={13} />
                  Marcar Tarefa
                </button>
                {nextStatus && (
                  <button
                    onClick={() => onStatusChange(lead.id, nextStatus)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors duration-150"
                  >
                    <ArrowRight size={13} />
                    Avançar Etapa
                  </button>
                )}
              </div>
            </section>

            {/* Próxima ação */}
            {lead.status !== 'fechado_perdido' && (
              <section>
                <button
                  onClick={() => setTaskModal({ open: true, title: nextAction })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 group shadow-sm"
                >
                  <div className="text-left">
                    <p className="text-xs font-medium text-blue-200 mb-0.5">Próxima Ação Sugerida</p>
                    <p className="text-sm font-semibold">{nextAction}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="shrink-0 ml-3 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </button>
              </section>
            )}

            {/* Timeline */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Histórico de Interações ({sortedInteractions.length})
              </h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" />

                <ul className="space-y-5">
                  {sortedInteractions.map((interaction, idx) => {
                    const cfg = interactionIcons[interaction.type] ?? interactionIcons.note
                    const IconComp = cfg.icon

                    return (
                      <li key={interaction.id} className="flex gap-4 relative">
                        {/* Icon on timeline */}
                        <div
                          className={clsx(
                            'flex items-center justify-center w-7 h-7 rounded-full shrink-0 z-10',
                            cfg.colorClass
                          )}
                        >
                          <IconComp size={13} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {interactionTypeLabels[interaction.type]}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0">
                              {formatDate(interaction.date)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {interaction.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">por {interaction.user}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      {taskModal.open && (
        <NewTaskModal
          defaultTitle={taskModal.title}
          defaultLeadId={lead.id}
          defaultLeadName={lead.name}
          defaultLeadEmail={lead.email}
          defaultLeadPhone={lead.phone}
          onClose={() => setTaskModal({ open: false })}
          onAdd={(_task: Task) => setTaskModal({ open: false })}
        />
      )}
    </>
  )
}
