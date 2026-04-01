import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractName, extractPhone, normalizeOrigin, makeAvatar } from '@/lib/webhook-helpers'

type LeadStatus = 'novo' | 'em_atendimento' | 'proposta' | 'fechado_ganho' | 'fechado_perdido'

const VALID_STAGES: LeadStatus[] = [
  'novo',
  'em_atendimento',
  'proposta',
  'fechado_ganho',
  'fechado_perdido',
]

function authenticate(request: NextRequest): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) return true

  const authHeader = request.headers.get('Authorization')
  const secret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : request.headers.get('x-webhook-secret')

  return secret === webhookSecret
}

// ─── POST /api/webhooks/gptmaker/[stage] ──────────────────────────────────────
//
// Recebe dados de um lead e cadastra no CRM no estágio indicado na URL.
//
// Compatível com dois modos:
//   MODO 1 — Bloco "Enviar Webhook": { "name", "phone", "email", "company", ... }
//   MODO 2 — Webhooks nativos GPT Maker: { "chatName", "contextId", "phone", ... }
//
// Autenticação: Authorization: Bearer <WEBHOOK_SECRET>

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stage: string }> }
) {
  const { stage: stageParam } = await params
  const stage = stageParam as LeadStatus
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: 'Estágio inválido.', valid_stages: VALID_STAGES, received: stage },
      { status: 400 }
    )
  }

  if (!authenticate(request)) {
    return NextResponse.json(
      { error: 'Não autorizado. Verifique o WEBHOOK_SECRET.' },
      { status: 401 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido. Envie JSON válido.' },
      { status: 400 }
    )
  }

  const name = extractName(body)
  if (!name) {
    return NextResponse.json(
      { error: 'Nome obrigatório. Envie "name" ou "chatName".' },
      { status: 422 }
    )
  }

  const id  = crypto.randomUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      id,
      name,
      company:      String(body.company ?? '').trim(),
      email:        String(body.email ?? '').trim(),
      phone:        extractPhone(body),
      origin:       normalizeOrigin(String(body.origin ?? '')),
      status:       stage,
      value:        Number(body.value) || 0,
      assignee:     String(body.assignee ?? 'GPT Maker').trim(),
      avatar:       makeAvatar(name),
      tags:         Array.isArray(body.tags) ? (body.tags as string[]) : ['chatbot'],
      last_contact: now,
      created_at:   now,
    })
    .select('id, name, status, created_at')
    .single()

  if (error) {
    console.error('[webhook/gptmaker/stage] Supabase error:', error)
    return NextResponse.json({ error: 'Erro ao salvar lead.', detail: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      success: true,
      message: `Lead "${name}" cadastrado no estágio "${stage}".`,
      lead: { id: data.id, name: data.name, status: data.status, createdAt: data.created_at },
    },
    { status: 201 }
  )
}

export async function GET() {
  return NextResponse.json({ error: 'Método não permitido. Use POST.' }, { status: 405 })
}
