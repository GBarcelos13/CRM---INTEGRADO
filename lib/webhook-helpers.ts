// Helpers compartilhados entre os endpoints de webhook do GPT Maker

type LeadOrigin = 'instagram' | 'linkedin' | 'indicacao' | 'site' | 'whatsapp' | 'evento'

const VALID_ORIGINS: LeadOrigin[] = [
  'instagram',
  'linkedin',
  'indicacao',
  'site',
  'whatsapp',
  'evento',
]

/**
 * Extrai o nome do lead.
 * Suporta: "name", "chatName" (GPT Maker nativo), "contact_name"
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
 * Suporta "phone" e "contextId" (no WhatsApp, GPT Maker usa o número como contextId).
 */
export function extractPhone(body: Record<string, unknown>): string {
  const phone = String(body.phone ?? '').trim()
  if (phone) return phone

  const ctx = String(body.contextId ?? '').replace(/@.*$/, '').trim()
  if (/^\d{10,15}$/.test(ctx)) return ctx

  return ''
}

export function normalizeOrigin(raw: string): LeadOrigin {
  const lower = raw.toLowerCase()
  return VALID_ORIGINS.includes(lower as LeadOrigin) ? (lower as LeadOrigin) : 'whatsapp'
}

export function makeAvatar(name: string): string {
  const words = name.split(/\s+/)
  return words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase()
}
