'use client'

import { useState, useEffect } from 'react'
import {
  Plug,
  Copy,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Circle,
  Terminal,
  Workflow,
} from 'lucide-react'
import clsx from 'clsx'

// ─── Dados ────────────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'novo',            label: 'Novo',           color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  { key: 'em_atendimento',  label: 'Em Atendimento', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  { key: 'proposta',        label: 'Proposta',       color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { key: 'fechado_ganho',   label: 'Fechado Ganho',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'fechado_perdido', label: 'Fechado Perdido',color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
]

const NATIVE_EVENTS = [
  { event: 'onFirstInteraction',  stage: 'novo',           desc: 'Primeiro contato do lead com o chatbot' },
  { event: 'onStartInteraction',  stage: 'novo',           desc: 'Início de cada sessão de atendimento' },
  { event: 'onFinishInteraction', stage: 'em_atendimento', desc: 'Fim do atendimento automático' },
  { event: 'onTransfer',          stage: 'em_atendimento', desc: 'Lead transferido para atendente humano' },
  { event: 'onCreateEvent',       stage: 'proposta',       desc: 'Agendamento realizado pelo chatbot' },
  { event: 'onNewMessage',        stage: 'novo',           desc: 'Nova mensagem recebida' },
]

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={clsx(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0',
        copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado!' : label}
    </button>
  )
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = 'json' }: { code: string; lang?: string }) {
  return (
    <div className="relative">
      <pre className={clsx(
        'text-xs rounded-lg p-4 overflow-x-auto leading-relaxed font-mono',
        lang === 'json' ? 'bg-slate-900 text-emerald-400' : 'bg-slate-900 text-sky-300'
      )}>
        {code}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Accordion({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
      >
        <span className="flex items-center gap-2">
          <Icon size={15} className="text-slate-500" />
          {title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 py-4 border-t border-slate-200 space-y-4">{children}</div>}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [baseUrl, setBaseUrl] = useState('https://seu-dominio.com')
  const [secretVisible, setSecretVisible] = useState(false)

  useEffect(() => { setBaseUrl(window.location.origin) }, [])

  const webhookUrl = (stage: string) => `${baseUrl}/api/webhooks/gptmaker/${stage}`
  const eventUrl   = `${baseUrl}/api/webhooks/gptmaker/event`
  const secret     = 'ec3f94b046ab6a5106ee600fda858804bdc9cae50b98c462a35c3b915cddef97'

  return (
    <div className="flex flex-col h-full p-6 gap-6 max-w-4xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Plug size={22} className="text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Integrações</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Configure integrações externas para automatizar o cadastro de leads no CRM.
        </p>
      </div>

      {/* Card GPT MAKER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header do card */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-600 shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">GPT Maker</h2>
              <p className="text-xs text-slate-500">Chatbot IA → CRM via Webhook</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <Circle size={6} className="fill-current text-emerald-500" />
            Ativo
          </span>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Webhook Secret */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Webhook Secret</p>
            <p className="text-xs text-slate-500 mb-2">
              Envie este valor no header{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Authorization: Bearer &lt;secret&gt;</code>{' '}
              em todas as requisições ao CRM.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <code className="flex-1 text-xs text-slate-700 font-mono tracking-widest truncate">
                  {secretVisible ? secret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setSecretVisible(v => !v)}
                  className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                >
                  {secretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <CopyButton text={secret} label="Copiar" />
            </div>
          </div>

          {/* Divisor de métodos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Workflow size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Método 1 — Bloco &quot;Enviar Webhook&quot;</span>
              </div>
              <p className="text-xs text-blue-600">Você controla quando enviar. Ideal para qualificar o lead em pontos específicos do fluxo.</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-2 mb-1">
                <Terminal size={14} className="text-violet-600" />
                <span className="text-xs font-semibold text-violet-700">Método 2 — Webhooks Nativos</span>
              </div>
              <p className="text-xs text-violet-600">GPT Maker dispara automaticamente por evento. Configure via API do GPT Maker.</p>
            </div>
          </div>

          {/* ── MÉTODO 1: URLs por estágio ── */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Workflow size={15} className="text-blue-500" />
              Método 1 — URLs por Estágio (Bloco &quot;Enviar Webhook&quot;)
            </p>
            <p className="text-xs text-slate-500 mb-3">
              No flow builder do GPT Maker, adicione um bloco <strong>Enviar Webhook</strong> e use a URL
              correspondente ao estágio em que o lead deve entrar. Configure o body com as variáveis coletadas no fluxo.
            </p>
            <div className="space-y-2">
              {STAGES.map(s => (
                <div key={s.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className={clsx('flex items-center gap-1.5 shrink-0 text-xs font-medium px-2 py-1 rounded-md', s.color)} style={{ minWidth: 148 }}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                    {s.label}
                  </span>
                  <code className="flex-1 text-xs text-slate-600 font-mono truncate">{webhookUrl(s.key)}</code>
                  <CopyButton text={webhookUrl(s.key)} />
                </div>
              ))}
            </div>

            <Accordion title="Body do Método 1 (campos aceitos)" icon={ChevronDown}>
              <p className="text-xs text-slate-600">
                Substitua os valores pelas variáveis coletadas no seu fluxo do GPT Maker.
                Apenas <code className="bg-slate-100 px-1 rounded">name</code> ou <code className="bg-slate-100 px-1 rounded">chatName</code> são obrigatórios.
              </p>
              <CodeBlock code={`{
  "name":     "{{nome}}",
  "phone":    "{{telefone}}",
  "email":    "{{email}}",
  "company":  "{{empresa}}",
  "origin":   "whatsapp",
  "value":    0,
  "assignee": "GPT Maker",
  "tags":     ["chatbot"]
}`} />
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-1.5 pr-3 text-slate-600 font-medium">Campo</th>
                    <th className="text-left py-1.5 pr-3 text-slate-600 font-medium">Alias aceito</th>
                    <th className="text-left py-1.5 pr-3 text-slate-600 font-medium">Obrig.</th>
                    <th className="text-left py-1.5 text-slate-600 font-medium">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { f: 'name',     alias: 'chatName, contact_name', req: true,  d: 'Nome do lead' },
                    { f: 'phone',    alias: 'contextId (se for número)', req: false, d: 'Telefone com DDD' },
                    { f: 'email',    alias: '—',           req: false, d: 'E-mail do lead' },
                    { f: 'company',  alias: '—',           req: false, d: 'Empresa' },
                    { f: 'origin',   alias: '—',           req: false, d: 'instagram | linkedin | indicacao | site | whatsapp | evento' },
                    { f: 'value',    alias: '—',           req: false, d: 'Valor estimado (R$)' },
                    { f: 'assignee', alias: '—',           req: false, d: 'Responsável (padrão: "GPT Maker")' },
                    { f: 'tags',     alias: '—',           req: false, d: 'Lista de tags (padrão: ["chatbot"])' },
                  ].map(row => (
                    <tr key={row.f}>
                      <td className="py-1.5 pr-3"><code className="bg-slate-100 px-1 rounded">{row.f}</code></td>
                      <td className="py-1.5 pr-3 text-slate-400 text-[11px]">{row.alias}</td>
                      <td className="py-1.5 pr-3">{row.req ? <span className="text-red-600 font-medium">Sim</span> : <span className="text-slate-400">Não</span>}</td>
                      <td className="py-1.5 text-slate-600">{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion>
          </div>

          {/* ── MÉTODO 2: Webhooks nativos ── */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Terminal size={15} className="text-violet-500" />
              Método 2 — Webhooks Nativos por Evento (API do GPT Maker)
            </p>
            <p className="text-xs text-slate-500 mb-3">
              O GPT Maker dispara automaticamente um POST para a URL abaixo quando eventos ocorrem no chatbot.
              Configure via API do GPT Maker usando seu token e o ID do agente.
            </p>

            {/* URL do endpoint de eventos */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
              <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-1 rounded shrink-0">
                Endpoint de Eventos
              </span>
              <code className="flex-1 text-xs text-slate-600 font-mono truncate">{eventUrl}</code>
              <CopyButton text={eventUrl} />
            </div>

            {/* Mapeamento evento → estágio */}
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-600 mb-2">Mapeamento automático evento → estágio:</p>
              <div className="space-y-1.5">
                {NATIVE_EVENTS.map(e => (
                  <div key={e.event} className="flex items-center gap-2 text-xs">
                    <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded shrink-0">{e.event}</code>
                    <span className="text-slate-400">→</span>
                    <span className="font-medium text-slate-700">{e.stage}</span>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-500">{e.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Accordion title="Como configurar via API do GPT Maker" icon={Terminal}>
              <p className="text-xs text-slate-600 mb-2">
                Faça uma requisição <strong>PUT</strong> para a API do GPT Maker com seu token e o ID do agente.
                Substitua <code className="bg-slate-100 px-1 rounded">SEU_AGENT_ID</code> e{' '}
                <code className="bg-slate-100 px-1 rounded">SEU_TOKEN_GPTMAKER</code> pelos valores reais.
              </p>
              <CodeBlock lang="bash" code={`curl -X PUT \\
  https://api.gptmaker.ai/v2/agent/SEU_AGENT_ID/webhooks \\
  -H "Authorization: Bearer SEU_TOKEN_GPTMAKER" \\
  -H "Content-Type: application/json" \\
  -d '{
    "onFirstInteraction":  "${eventUrl}",
    "onStartInteraction":  "${eventUrl}",
    "onFinishInteraction": "${eventUrl}",
    "onTransfer":          "${eventUrl}",
    "onCreateEvent":       "${eventUrl}"
  }'`} />
              <p className="text-xs text-slate-500">
                O token do GPT Maker é gerado em{' '}
                <strong>app.gptmaker.ai → Developers</strong>.
                O agentId está na URL do seu agente.
              </p>
            </Accordion>

            <Accordion title="Payload que o GPT Maker envia (eventos nativos)" icon={ChevronDown}>
              <p className="text-xs text-slate-600 mb-2">
                O CRM aceita o payload nativo do GPT Maker. Os campos <code className="bg-slate-100 px-1 rounded">chatName</code> e{' '}
                <code className="bg-slate-100 px-1 rounded">contextId</code> são mapeados automaticamente para nome e telefone.
              </p>
              <CodeBlock code={`{
  "event":     "onFirstInteraction",
  "agentId":   "abc123",
  "contextId": "5511999999999",
  "chatName":  "João Silva",
  "phone":     "5511999999999",
  "timestamp": "2026-04-01T10:00:00Z"
}`} />
              <p className="text-xs text-slate-500">
                Leads com o mesmo telefone não são duplicados — o CRM verifica antes de inserir.
              </p>
            </Accordion>
          </div>

          {/* Resposta de sucesso */}
          <Accordion title="Resposta de sucesso (HTTP 201)" icon={ChevronDown}>
            <CodeBlock code={`{
  "success": true,
  "message": "Lead \\"João Silva\\" cadastrado no estágio \\"novo\\".",
  "lead": {
    "id": "uuid-gerado",
    "name": "João Silva",
    "status": "novo",
    "createdAt": "2026-04-01T10:00:00.000Z"
  }
}`} />
          </Accordion>

        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center gap-2 text-center">
        <Plug size={24} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-400">Mais integrações em breve</p>
        <p className="text-xs text-slate-400">RD Station, HubSpot, Zapier e outros conectores serão adicionados aqui.</p>
      </div>

    </div>
  )
}
