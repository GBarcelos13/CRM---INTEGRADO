import { NextResponse } from 'next/server'

// GET /api/config/webhook-secret
// Retorna se o secret está configurado e os últimos 8 caracteres (para identificação).
// O valor completo nunca é enviado ao cliente.
export async function GET() {
  const secret = process.env.WEBHOOK_SECRET ?? ''
  if (!secret) {
    return NextResponse.json({ configured: false, hint: null })
  }
  return NextResponse.json({
    configured: true,
    hint: '••••••••••••••••••••••••' + secret.slice(-8),
  })
}
