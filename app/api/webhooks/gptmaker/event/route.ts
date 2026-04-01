import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractName, extractPhone, normalizeOrigin, makeAvatar } from '@/lib/webhook-helpers'

// ─── Mapeamento de eventos → estágio do pipeline ──────────────────────────────

const EVENT_TO_STAGE: Record<string, string> = {
  onFirstInteraction:  'novo',
  onStartInteraction:  'novo',
  onNewMessage:        'novo',
  onFinishInteraction: 'em_atendimento',
  onTransfer:          'em_atendimento',
  onLackKnowledge:     'novo',
  onCreateEvent:       'proposta',
  onCancelEvent:       'novo',
}

// ─── POST /api/webhooks/gptmaker/event ────────────────────────────────────────
//
// Recebe webhooks nativos do GPT Maker (configurados via API do GPT Maker):
//   PUT https://api.gptmaker.ai/v2/agent/{agentId}/webhooks
//   { "onFirstInteraction": "https://seucrm.com/api/webhooks/gptmaker/event" }
//
// Payload esperado do GPT Maker:
//   {
//     "event":     "onFirstInteraction",  // tipo do evento
//     "agentId":   "abc123",
//     "contextId": "5511999999999",        // ID do contato (no WhatsApp = número)
//     "chatName":  "João Silva",           // nome exibido no chat
//     "phone":     "5511999999999",        // telefone (quando disponível)
//     "timestamp": "2026-04-01T10:00:00Z"
//   }
//
// O estágio é inferido automaticamente a partir do evento recebido.
// Autenticação: Authorization: Bearer <WEBHOOK_SECRET>

export async function POST(request: NextRequest) {
  // ── 1. Autenticar ──────────────────────────────────────────────────────────
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (webhookSecret) {
    const authHeader = request.headers.get('Authorization')
    const secret = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.headers.get('x-webhook-secret')

    if (secret !== webhookSecret) {
      return NextResponse.json(
        { error: 'Não autorizado. Verifique o WEBHOOK_SECRET.' },
        { status: 401 }
      )
    }
  }

  // ── 2. Parsear body ────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido. Envie JSON válido.' },
      { status: 400 }
    )
  }

  // ── 3. Determinar estágio a partir do evento ───────────────────────────────
  const event = String(body.event ?? '').trim()
  const stage = EVENT_TO_STAGE[event] ?? 'novo'

  // ── 4. Extrair dados do lead ───────────────────────────────────────────────
  const name = extractName(body)
  if (!name) {
    // Lead sem nome: registrar com o contextId ou número como identificador
    const fallback = String(body.contextId ?? body.phone ?? '').replace(/@.*$/, '').trim()
    if (!fallback) {
      return NextResponse.json(
        { error: 'Não foi possível identificar o lead. "chatName", "name" ou "contextId" são obrigatórios.' },
        { status: 422 }
      )
    }
    // Usar número como nome temporário
    body = { ...body, name: fallback }
  }

  const finalName = extractName(body) || String(body.contextId ?? '').replace(/@.*$/, '')
  const phone     = extractPhone(body)
  const origin    = normalizeOrigin(String(body.origin ?? 'whatsapp'))
  const tags      = Array.isArray(body.tags) ? (body.tags as string[]) : ['chatbot', event].filter(Boolean)

  // ── 5. Verificar se lead já existe pelo phone ou contextId (evitar duplicata) ──
  if (phone) {
    const { data: existing } = await supabase
      .from('leads')
      .select('id, name, status')
      .eq('phone', phone)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Lead com telefone "${phone}" já existe no CRM.`,
          lead: existing,
        },
        { status: 200 }
      )
    }
  }

  // ── 6. Inserir lead ────────────────────────────────────────────────────────
  const id  = crypto.randomUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      id,
      name:         finalName,
      company:      String(body.company ?? '').trim(),
      email:        String(body.email ?? '').trim(),
      phone,
      origin,
      status:       stage,
      value:        Number(body.value) || 0,
      assignee:     String(body.assignee ?? 'GPT Maker').trim(),
      avatar:       makeAvatar(finalName),
      tags,
      last_contact: now,
      created_at:   now,
    })
    .select('id, name, status, created_at')
    .single()

  if (error) {
    console.error('[webhook/gptmaker/event] Supabase error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar lead.', detail: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      message: `Lead "${finalName}" cadastrado via evento "${event}" no estágio "${stage}".`,
      lead: { id: data.id, name: data.name, status: data.status, createdAt: data.created_at },
    },
    { status: 201 }
  )
}

export async function GET() {
  return NextResponse.json({ error: 'Método não permitido. Use POST.' }, { status: 405 })
}
