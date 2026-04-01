import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Inicialização lazy: o cliente só é criado na primeira requisição,
// não durante o build do Next.js (quando as env vars podem não existir).
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// Proxy backward-compatible: todo código que usa `supabase.from(...)` continua funcionando.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    const client = getClient()
    const value = client[prop as keyof SupabaseClient]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value
  },
})
