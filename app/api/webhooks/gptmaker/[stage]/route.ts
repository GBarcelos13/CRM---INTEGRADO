import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = 'novo' | 'em_atendimento' | 'proposta' | 'fechado_ganho' | 'fechado_perdido'
type LeadOrigin = 'instagram' | 'linkedin' | 'indicacao' | 'site' | 'whatsapp' | 'evento'

const VALID_STAGES: LeadStatus[] = [
  'novo',
  'em_atendimento',
  'proposta',
  'fechado_ganho',
  'fechado_perdido',
]

const VALID_ORIGINS: LeadOrigin[] = [
  'instagram',
  'linkedin',
  'indicacao',
  'site',
  'whatsapp',
  'evento',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Autentica via WEBHOOK_SECRET (header Authorization ou x-webhook-secret). */
function authenticate(request: NextRequest): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) return true // sem secret configurado = aceita tudo

  const authHeader = request.headers.get('Authorization')
  const secret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : request.headers.get('x-webhook-secret')

  return secret === webhookSecret
}

/**
 * Extrai o nome do lead a partir do payload.
 * Suporta:
 *  - "name"     → campo customizado (Enviar Webhook)
 *  - "chatName" → campo nativo do GPT Maker (onFirstInteraction, etc.)
 *  - "contextId"→ fallback (GPT Maker usa phone como contextId no WhatsApp)
 */
export function extractName(body: Record<string, unknown>): string {
  return (
    String(body.name ?? '').trim() ||
    String(body.chatName ?? '').trim() ||
    String(body.contact_name ?? '').trim() ||
    ''
  )
}

/**
 * Extrai o telefone do lead.
 * Suporta "phone", "contextId" (no WhatsApp, GPT Maker usa o número como contextId).
 */
export function extractPhone(body: Record<string, unknown>): string {
  const phone = String(body.phone ?? '').trim()
  if (phone) return phone

  // contextId no WhatsApp costuma ser o número (ex: "5511999999999@c.us" ou "5511999999999")
  const ctx = String(body.contextId ?? '').replace(/@.*$/, '').trim()
  if (/^\d{10,15}$/.test(ctx)) return ctx

  return ''
}

export function normalizeOrigin(raw: string): LeadOrigin {
  const lower = raw.toLowerCase()
  if (VALID_ORIGINS.includes(lower as LeadOrigin)) return lower as LeadOrigin
  return 'whatsapp'
}

export function makeAvatar(name: string): string {
  const words = name.split(/\s+/)
  return words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase()
}

// ─── POST /api/webhooks/gptmaker/[stage] ──────────────────────────────────────
//
// Recebe dados de um lead e cadastra no CRM no estágio indicado na URL.
//
// Compatível com dois modos:
//
// MODO 1 — Bloco "Enviar Webhook" no flow builder (campos customizados):
//   { "name", "phone", "email", "company", "origin", "value", "assignee", "tags" }
//
// MODO 2 — Webhooks nativos do GPT Maker (campos da plataforma):
//   { "chatName", "contextId", "phone", "agentId", "event", ... }
//
// Autenticação: Authorization: Bearer <WEBHOOK_SECRET>  ou  x-webhook-secret: <WEBHOOK_SECRET>

export async function POST(
  request: NextRequest,
  { params }: { params: { stage: string } }
) {
  // ── 1. Validar estágio ─────────────────────────────────────────────────────
  const stage = params.stage as LeadStatus
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: 'Estágio inválido.', valid_stages: VALID_STAGES, received: stage },
      { status: 400 }
    )
  }

  // ── 2. Autenticar ──────────────────────────────────────────────────────────
  if (!authenticate(request)) {
    return NextResponse.json(
      { error: 'Não autorizado. Verifique o WEBHOOK_SECRET.' },
      { status: 401 }
    )
  }

  // ── 3. Parsear body ────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido. Envie JSON válido.' },
      { status: 400 }
    )
  }

  // ── 4. Extrair campos (suporta formato customizado e nativo do GPT Maker) ──
  const name = extractName(body)
  if (!name) {
    return NextResponse.json(
      { error: 'Nome obrigatório. Envie "name" ou "chatName".' },
      { status: 422 }
    )
  }

  const phone    = extractPhone(body)
  const email    = String(body.email ?? '').trim()
  const company  = String(body.company ?? '').trim()
  const origin   = normalizeOrigin(String(body.origin ?? ''))
  const value    = Number(body.value) || 0
  const assignee = String(body.assignee ?? 'GPT Maker').trim()
  const tags     = Array.isArray(body.tags) ? (body.tags as string[]) : ['chatbot']

  // ── 5. Inserir lead ────────────────────────────────────────────────────────
  const id  = crypto.randomUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      id,
      name,
      company,
      email,
      phone,
      origin,
      status: stage,
      value,
      assignee,
      avatar: makeAvatar(name),
      tags,
      last_contact: now,
      created_at: now,
    })
    .select('id, name, status, created_at')
    .single()

  if (error) {
    console.error('[webhook/gptmaker/stage] Supabase error:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar lead.', detail: error.message },
      { status: 500 }
    )
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
