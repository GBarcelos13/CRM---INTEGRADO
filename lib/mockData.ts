// ============================================================
// TYPES
// ============================================================

export type LeadStatus =
  | 'novo'
  | 'em_atendimento'
  | 'proposta'
  | 'fechado_ganho'
  | 'fechado_perdido'

export type LeadOrigin =
  | 'instagram'
  | 'linkedin'
  | 'indicacao'
  | 'site'
  | 'whatsapp'
  | 'evento'

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'whatsapp'

export type TaskType = 'ligacao' | 'email' | 'reuniao' | 'follow_up'

export type TaskPriority = 'alta' | 'media' | 'baixa'

export interface Interaction {
  id: string
  type: InteractionType
  description: string
  date: string // ISO string
  user: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  origin: LeadOrigin
  status: LeadStatus
  value: number
  tags: string[]
  assignee: string
  avatar: string // initials
  lastContact: string // ISO string
  createdAt: string // ISO string
  interactions: Interaction[]
}

export interface Task {
  id: string
  title: string
  leadId?: string
  leadName?: string
  leadEmail?: string
  leadPhone?: string
  dueDate: string // ISO string
  completed: boolean
  priority: TaskPriority
  type: TaskType
}

// ============================================================
// STATUS CONFIG
// ============================================================

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; textColor: string; bgColor: string }
> = {
  novo: {
    label: 'Novo',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  em_atendimento: {
    label: 'Em Atendimento',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  proposta: {
    label: 'Proposta',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  fechado_ganho: {
    label: 'Fechado ✓',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  fechado_perdido: {
    label: 'Fechado ✗',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
  },
}

// ============================================================
// ORIGIN CONFIG
// ============================================================

export const ORIGIN_CONFIG: Record<
  LeadOrigin,
  { label: string; textColor: string; bgColor: string }
> = {
  instagram: {
    label: 'Instagram',
    textColor: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
  linkedin: {
    label: 'LinkedIn',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  indicacao: {
    label: 'Indicação',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  site: {
    label: 'Site',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  whatsapp: {
    label: 'WhatsApp',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  evento: {
    label: 'Evento',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
}

// ============================================================
// PIPELINE COLUMNS
// ============================================================

export interface PipelineColumn {
  id: LeadStatus
  title: string
  headerColor: string
  lightBg: string
  badgeColor: string
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    id: 'novo',
    title: 'Novo',
    headerColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'em_atendimento',
    title: 'Em Atendimento',
    headerColor: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    headerColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'fechado_ganho',
    title: 'Fechado ✓',
    headerColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function isLeadForgotten(lead: Lead): boolean {
  if (lead.status === 'fechado_ganho' || lead.status === 'fechado_perdido') {
    return false
  }
  const lastContact = new Date(lead.lastContact)
  const now = new Date()
  const diffMs = now.getTime() - lastContact.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > 7
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 0) {
    const future = Math.abs(diffDays)
    if (future === 1) return 'Amanhã'
    return `Em ${future} dias`
  }
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 14) return '1 semana atrás'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
  if (diffDays < 60) return '1 mês atrás'
  return `${Math.floor(diffDays / 30)} meses atrás`
}

// ============================================================
// MOCK DATA — LEADS
// ============================================================

// Reference date: 2026-03-22 (today)
// Some leads have lastContact > 7 days ago to trigger "forgotten"

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Fernanda Oliveira',
    email: 'fernanda.oliveira@techsolutions.com.br',
    phone: '(11) 99234-5678',
    company: 'Tech Solutions Ltda',
    origin: 'linkedin',
    status: 'proposta',
    value: 18500,
    tags: ['enterprise', 'software', 'urgente'],
    assignee: 'Ana Silva',
    avatar: 'FO',
    lastContact: '2026-03-21T10:30:00.000Z',
    createdAt: '2026-02-15T08:00:00.000Z',
    interactions: [
      {
        id: 'int-001-1',
        type: 'call',
        description: 'Ligação inicial de qualificação. Cliente demonstrou interesse nos planos enterprise.',
        date: '2026-02-15T14:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-001-2',
        type: 'email',
        description: 'Enviei apresentação da empresa e cases de sucesso no setor de tecnologia.',
        date: '2026-02-18T09:15:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-001-3',
        type: 'meeting',
        description: 'Reunião de demo online. Apresentei todas as funcionalidades. Cliente ficou muito interessado.',
        date: '2026-03-01T15:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-001-4',
        type: 'whatsapp',
        description: 'Cliente perguntou sobre integração com sistema legado. Respondi e agendei call técnico.',
        date: '2026-03-10T11:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-001-5',
        type: 'email',
        description: 'Enviei proposta comercial detalhada com 3 opções de plano. Aguardando retorno.',
        date: '2026-03-21T10:30:00.000Z',
        user: 'Ana Silva',
      },
    ],
  },
  {
    id: 'lead-002',
    name: 'Ricardo Mendes',
    email: 'ricardo@construtoravalor.com.br',
    phone: '(21) 98765-4321',
    company: 'Construtora Valor',
    origin: 'indicacao',
    status: 'em_atendimento',
    value: 32000,
    tags: ['construcao', 'b2b', 'alto-valor'],
    assignee: 'Carlos Souza',
    avatar: 'RM',
    lastContact: '2026-03-10T16:00:00.000Z',
    createdAt: '2026-03-01T09:00:00.000Z',
    interactions: [
      {
        id: 'int-002-1',
        type: 'whatsapp',
        description: 'Primeiro contato via WhatsApp após indicação do cliente Grupo Alpha.',
        date: '2026-03-01T09:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-002-2',
        type: 'call',
        description: 'Ligação de qualificação. Empresa tem 50 funcionários e precisa de gestão completa.',
        date: '2026-03-05T14:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-002-3',
        type: 'meeting',
        description: 'Visita presencial ao escritório. Mapeei todas as necessidades. Decisor é o CEO.',
        date: '2026-03-10T16:00:00.000Z',
        user: 'Carlos Souza',
      },
    ],
  },
  {
    id: 'lead-003',
    name: 'Camila Ferreira',
    email: 'camila.ferreira@marketingpro.com.br',
    phone: '(31) 97654-3210',
    company: 'Marketing Pro Agency',
    origin: 'instagram',
    status: 'novo',
    value: 8900,
    tags: ['agencia', 'marketing', 'smb'],
    assignee: 'Ana Silva',
    avatar: 'CF',
    lastContact: '2026-03-20T11:00:00.000Z',
    createdAt: '2026-03-20T11:00:00.000Z',
    interactions: [
      {
        id: 'int-003-1',
        type: 'whatsapp',
        description: 'Lead entrou via Instagram DM. Preencheu formulário no link da bio. Aguarda contato.',
        date: '2026-03-20T11:00:00.000Z',
        user: 'Sistema',
      },
    ],
  },
  {
    id: 'lead-004',
    name: 'Bruno Almeida',
    email: 'bruno.almeida@logisticamax.com.br',
    phone: '(11) 94567-8901',
    company: 'LogísticaMax',
    origin: 'site',
    status: 'fechado_ganho',
    value: 45000,
    tags: ['logistica', 'enterprise', 'fechado'],
    assignee: 'Carlos Souza',
    avatar: 'BA',
    lastContact: '2026-03-18T10:00:00.000Z',
    createdAt: '2026-01-10T08:00:00.000Z',
    interactions: [
      {
        id: 'int-004-1',
        type: 'call',
        description: 'Primeiro contato. Lead veio pelo formulário do site. Empresa de médio porte.',
        date: '2026-01-10T14:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-004-2',
        type: 'meeting',
        description: 'Demo completa do produto. Equipe técnica participou.',
        date: '2026-01-25T10:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-004-3',
        type: 'email',
        description: 'Proposta enviada com desconto especial para contrato anual.',
        date: '2026-02-01T09:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-004-4',
        type: 'note',
        description: 'Cliente assinou contrato! Valor: R$ 45.000 anuais. Início do onboarding em 01/04.',
        date: '2026-03-18T10:00:00.000Z',
        user: 'Carlos Souza',
      },
    ],
  },
  {
    id: 'lead-005',
    name: 'Juliana Costa',
    email: 'juliana.costa@clinicavida.com.br',
    phone: '(41) 93456-7890',
    company: 'Clínica Vida Saúde',
    origin: 'evento',
    status: 'em_atendimento',
    value: 12000,
    tags: ['saude', 'clinica', 'smb'],
    assignee: 'Ana Silva',
    avatar: 'JC',
    lastContact: '2026-03-08T14:00:00.000Z',
    createdAt: '2026-03-05T09:00:00.000Z',
    interactions: [
      {
        id: 'int-005-1',
        type: 'meeting',
        description: 'Conheci no evento HealthTech BH. Muito interessada na solução para clínicas.',
        date: '2026-03-05T09:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-005-2',
        type: 'call',
        description: 'Ligação de follow-up pós evento. Agendei demo para semana que vem.',
        date: '2026-03-08T14:00:00.000Z',
        user: 'Ana Silva',
      },
    ],
  },
  {
    id: 'lead-006',
    name: 'Marcos Rodrigues',
    email: 'marcos@grupoalpha.com.br',
    phone: '(11) 92345-6789',
    company: 'Grupo Alpha Investimentos',
    origin: 'linkedin',
    status: 'proposta',
    value: 78000,
    tags: ['financeiro', 'enterprise', 'vip', 'alto-valor'],
    assignee: 'Ana Silva',
    avatar: 'MR',
    lastContact: '2026-03-12T09:00:00.000Z',
    createdAt: '2026-02-01T08:00:00.000Z',
    interactions: [
      {
        id: 'int-006-1',
        type: 'email',
        description: 'Contato inicial via LinkedIn. Enviou mensagem pedindo informações sobre planos enterprise.',
        date: '2026-02-01T08:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-006-2',
        type: 'meeting',
        description: 'Reunião no escritório deles. Participaram o CEO e o diretor de TI.',
        date: '2026-02-20T10:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-006-3',
        type: 'email',
        description: 'Proposta customizada enviada. Inclui módulos extras de BI e relatórios avançados.',
        date: '2026-03-05T09:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-006-4',
        type: 'call',
        description: 'Ligação para esclarecer dúvidas técnicas da proposta. Estão em fase de aprovação interna.',
        date: '2026-03-12T09:00:00.000Z',
        user: 'Ana Silva',
      },
    ],
  },
  {
    id: 'lead-007',
    name: 'Patrícia Lima',
    email: 'patricia.lima@ecommercebrasil.com.br',
    phone: '(11) 91234-5678',
    company: 'E-Commerce Brasil',
    origin: 'whatsapp',
    status: 'novo',
    value: 6500,
    tags: ['ecommerce', 'varejo', 'smb'],
    assignee: 'Carlos Souza',
    avatar: 'PL',
    lastContact: '2026-03-05T10:00:00.000Z',
    createdAt: '2026-03-05T10:00:00.000Z',
    interactions: [
      {
        id: 'int-007-1',
        type: 'whatsapp',
        description: 'Entrou em contato via WhatsApp business. Quer saber sobre integração com e-commerce.',
        date: '2026-03-05T10:00:00.000Z',
        user: 'Sistema',
      },
    ],
  },
  {
    id: 'lead-008',
    name: 'Eduardo Santos',
    email: 'eduardo@consultoriaes.com.br',
    phone: '(51) 98901-2345',
    company: 'ES Consultoria',
    origin: 'indicacao',
    status: 'fechado_perdido',
    value: 15000,
    tags: ['consultoria', 'perdido'],
    assignee: 'Carlos Souza',
    avatar: 'ES',
    lastContact: '2026-02-28T15:00:00.000Z',
    createdAt: '2026-01-20T08:00:00.000Z',
    interactions: [
      {
        id: 'int-008-1',
        type: 'call',
        description: 'Ligação de qualificação. Empresa pequena com 5 funcionários.',
        date: '2026-01-20T10:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-008-2',
        type: 'meeting',
        description: 'Demo online realizada. Gostou do produto mas achou o preço elevado.',
        date: '2026-02-10T14:00:00.000Z',
        user: 'Carlos Souza',
      },
      {
        id: 'int-008-3',
        type: 'note',
        description: 'Cliente optou por solução concorrente mais barata. Negociação encerrada.',
        date: '2026-02-28T15:00:00.000Z',
        user: 'Carlos Souza',
      },
    ],
  },
  {
    id: 'lead-009',
    name: 'Vanessa Carvalho',
    email: 'vanessa@rededucacao.com.br',
    phone: '(61) 97890-1234',
    company: 'Rede Educação Digital',
    origin: 'site',
    status: 'em_atendimento',
    value: 22000,
    tags: ['educacao', 'b2b', 'medio'],
    assignee: 'Ana Silva',
    avatar: 'VC',
    lastContact: '2026-03-11T13:00:00.000Z',
    createdAt: '2026-02-25T08:00:00.000Z',
    interactions: [
      {
        id: 'int-009-1',
        type: 'email',
        description: 'Lead veio pelo blog. Baixou e-book e cadastrou email. Nutrição automática iniciada.',
        date: '2026-02-25T08:00:00.000Z',
        user: 'Sistema',
      },
      {
        id: 'int-009-2',
        type: 'call',
        description: 'Ligação de qualificação. Rede com 12 escolas parceiras. Orçamento aprovado.',
        date: '2026-03-03T10:00:00.000Z',
        user: 'Ana Silva',
      },
      {
        id: 'int-009-3',
        type: 'meeting',
        description: 'Demo para equipe pedagógica e de TI. Ótima receptividade.',
        date: '2026-03-11T13:00:00.000Z',
        user: 'Ana Silva',
      },
    ],
  },
  {
    id: 'lead-010',
    name: 'Rafael Gomes',
    email: 'rafael.gomes@industrias-pg.com.br',
    phone: '(19) 96789-0123',
    company: 'Indústrias PG',
    origin: 'linkedin',
    status: 'novo',
    value: 54000,
    tags: ['industria', 'manufatura', 'enterprise'],
    assignee: 'Carlos Souza',
    avatar: 'RG',
    lastContact: '2026-03-01T09:00:00.000Z',
    createdAt: '2026-03-01T09:00:00.000Z',
    interactions: [
      {
        id: 'int-010-1',
        type: 'email',
        description: 'Conectou no LinkedIn e enviou mensagem. Grande empresa industrial com 200+ funcionários.',
        date: '2026-03-01T09:00:00.000Z',
        user: 'Carlos Souza',
      },
    ],
  },
]

// ============================================================
// MOCK DATA — TASKS
// ============================================================

// today = 2026-03-22
// overdue: dueDate before today
// today tasks: dueDate = today
// future: dueDate after today

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Ligar para Fernanda Oliveira para follow-up da proposta',
    leadId: 'lead-001',
    leadName: 'Fernanda Oliveira',
    dueDate: '2026-03-22T09:00:00.000Z',
    completed: false,
    priority: 'alta',
    type: 'ligacao',
  },
  {
    id: 'task-002',
    title: 'Enviar contrato revisado para Marcos Rodrigues',
    leadId: 'lead-006',
    leadName: 'Marcos Rodrigues',
    dueDate: '2026-03-22T14:00:00.000Z',
    completed: false,
    priority: 'alta',
    type: 'email',
  },
  {
    id: 'task-003',
    title: 'Agendar demo com Ricardo Mendes (CEO e equipe)',
    leadId: 'lead-002',
    leadName: 'Ricardo Mendes',
    dueDate: '2026-03-15T10:00:00.000Z',
    completed: false,
    priority: 'alta',
    type: 'reuniao',
  },
  {
    id: 'task-004',
    title: 'Follow-up Juliana Costa — sem resposta há 14 dias',
    leadId: 'lead-005',
    leadName: 'Juliana Costa',
    dueDate: '2026-03-14T09:00:00.000Z',
    completed: false,
    priority: 'media',
    type: 'follow_up',
  },
  {
    id: 'task-005',
    title: 'Ligar para Patrícia Lima — novo lead WhatsApp',
    leadId: 'lead-007',
    leadName: 'Patrícia Lima',
    dueDate: '2026-03-10T11:00:00.000Z',
    completed: false,
    priority: 'media',
    type: 'ligacao',
  },
  {
    id: 'task-006',
    title: 'Preparar relatório mensal de pipeline para reunião de vendas',
    dueDate: '2026-03-22T16:00:00.000Z',
    completed: false,
    priority: 'media',
    type: 'reuniao',
  },
  {
    id: 'task-007',
    title: 'Enviar case de sucesso LogísticaMax para Rafael Gomes',
    leadId: 'lead-010',
    leadName: 'Rafael Gomes',
    dueDate: '2026-03-25T10:00:00.000Z',
    completed: false,
    priority: 'media',
    type: 'email',
  },
  {
    id: 'task-008',
    title: 'Reunião de onboarding com Bruno Almeida — LogísticaMax',
    leadId: 'lead-004',
    leadName: 'Bruno Almeida',
    dueDate: '2026-03-28T14:00:00.000Z',
    completed: false,
    priority: 'alta',
    type: 'reuniao',
  },
  {
    id: 'task-009',
    title: 'Ligar para Vanessa Carvalho para apresentar proposta',
    leadId: 'lead-009',
    leadName: 'Vanessa Carvalho',
    dueDate: '2026-03-20T10:00:00.000Z',
    completed: true,
    priority: 'alta',
    type: 'ligacao',
  },
  {
    id: 'task-010',
    title: 'Enviar email de boas-vindas para Camila Ferreira',
    leadId: 'lead-003',
    leadName: 'Camila Ferreira',
    dueDate: '2026-03-21T09:00:00.000Z',
    completed: true,
    priority: 'baixa',
    type: 'email',
  },
]

// ============================================================
// CHART DATA
// ============================================================

export const chartData = [
  { mes: 'Set', leads: 18, conversoes: 4 },
  { mes: 'Out', leads: 24, conversoes: 7 },
  { mes: 'Nov', leads: 19, conversoes: 5 },
  { mes: 'Dez', leads: 31, conversoes: 9 },
  { mes: 'Jan', leads: 27, conversoes: 8 },
  { mes: 'Fev', leads: 35, conversoes: 11 },
  { mes: 'Mar', leads: 42, conversoes: 14 },
]

// ============================================================
// RECENT ACTIVITIES
// ============================================================

export interface RecentActivity {
  id: string
  text: string
  time: string
  color: 'green' | 'blue' | 'purple' | 'amber'
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp'
}

export const recentActivities: RecentActivity[] = [
  {
    id: 'act-001',
    text: 'Fernanda Oliveira recebeu proposta comercial por email',
    time: 'há 2 horas',
    color: 'blue',
    type: 'email',
  },
  {
    id: 'act-002',
    text: 'Reunião com Ricardo Mendes realizada — próximo passo: proposta',
    time: 'há 4 horas',
    color: 'purple',
    type: 'meeting',
  },
  {
    id: 'act-003',
    text: 'Bruno Almeida assinou contrato — R$ 45.000 fechado!',
    time: 'há 1 dia',
    color: 'green',
    type: 'note',
  },
  {
    id: 'act-004',
    text: 'Novo lead: Camila Ferreira entrou via Instagram',
    time: 'há 2 dias',
    color: 'amber',
    type: 'whatsapp',
  },
  {
    id: 'act-005',
    text: 'Ligação realizada com Marcos Rodrigues — dúvidas esclarecidas',
    time: 'há 10 dias',
    color: 'green',
    type: 'call',
  },
  {
    id: 'act-006',
    text: 'Vanessa Carvalho — demo realizada com equipe pedagógica',
    time: 'há 11 dias',
    color: 'purple',
    type: 'meeting',
  },
]
