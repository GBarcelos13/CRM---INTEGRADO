/**
 * Agente de Testes — CRM MUG Solutions
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sua-chave npm run test:agent
 *
 * O agente irá:
 *   1. Explorar o código-fonte
 *   2. Escrever testes unitários (funções puras) e de integração (Supabase)
 *   3. Executar os testes
 *   4. Corrigir falhas automaticamente
 *   5. Reportar o resultado final
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import path from 'path'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não definida.')
  console.error('   Execute: set ANTHROPIC_API_KEY=sua-chave && npm run test:agent')
  process.exit(1)
}

const CWD = path.resolve(process.cwd())

const PROMPT = `
Você é um engenheiro de QA especialista em TypeScript, Next.js 14 e Supabase.
Seu objetivo é criar e executar uma suíte de testes automatizados para o CRM MUG Solutions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 1 — Leia o código antes de escrever
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leia obrigatoriamente:
  • lib/mockData.ts  → tipos, configs e funções puras
  • lib/supabase.ts  → cliente Supabase
  • lib/db.ts        → funções de acesso ao banco
  • jest.config.ts   → configuração do Jest
  • .env.local       → variáveis de ambiente (Supabase)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 2 — Testes Unitários (funções puras)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crie __tests__/lib/mockData.test.ts com testes para:

  isLeadForgotten(lead)
    ✓ retorna true  quando lastContact > 7 dias atrás (lead ativo)
    ✓ retorna false quando lastContact < 7 dias atrás
    ✓ retorna false para status fechado_ganho/fechado_perdido
    ✓ trata lead com lastContact exatamente 7 dias atrás

  formatCurrency(value)
    ✓ formata valor inteiro em R$
    ✓ formata zero como R$ 0
    ✓ formata valor negativo

  formatDate(dateStr)
    ✓ formata ISO string em DD/MM/YYYY

  formatRelativeDate(dateStr)
    ✓ retorna "Hoje" para data de hoje
    ✓ retorna "Ontem" para data de ontem
    ✓ retorna "X dias atrás" para datas passadas recentes
    ✓ retorna "Amanhã" para data de amanhã

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 3 — Testes de Integração (Supabase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crie __tests__/lib/db.test.ts com testes para:

  fetchLeads()
    ✓ retorna um array de leads
    ✓ cada lead tem as propriedades obrigatórias (id, name, status, etc.)
    ✓ interações estão incluídas no lead

  fetchTasks()
    ✓ retorna um array de tarefas
    ✓ cada tarefa tem dueDate, priority e type válidos

  createLead() + deleteLead()
    ✓ cria um lead de teste com nome "TESTE_AGENT_XXX"
    ✓ verifica que foi criado (aparece no fetchLeads)
    ✓ deleta o lead criado no afterEach (limpeza obrigatória)

  updateLeadStatus()
    ✓ cria lead de teste, atualiza status, verifica mudança, deleta

  toggleTask()
    ✓ busca uma tarefa existente, alterna completed, verifica, restaura

REGRAS dos testes de integração:
  • Use prefixo "TESTE_AGENT_" em nomes de dados de teste
  • Sempre limpe os dados criados em afterEach ou afterAll
  • Use jest.setTimeout(15000) — operações de rede são lentas
  • Use expect.objectContaining() para validações parciais

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 4 — Execute e corrija
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Execute: npm test -- --verbose
  • Se houver erros de TypeScript ou Jest, leia a mensagem e corrija
  • Repita até todos os testes passarem (ou até 3 tentativas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 5 — Reporte o resultado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ao final, exiba:
  • Quantidade de testes: total / passou / falhou
  • Lista dos testes que passaram ✓
  • Lista dos testes que falharam ✗ (com motivo)
  • Cobertura geral da suíte
`

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   🤖  Agente de Testes — MUG CRM         ║')
  console.log('╚══════════════════════════════════════════╝\n')

  let turns = 0

  for await (const message of query({
    prompt: PROMPT,
    options: {
      cwd: CWD,
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
      permissionMode: 'acceptEdits',
      maxTurns: 40,
    },
  })) {
    if ('result' in message) {
      console.log('\n╔══════════════════════════════════════════╗')
      console.log('║   ✅  Resultado Final                     ║')
      console.log('╚══════════════════════════════════════════╝\n')
      console.log(message.result)
    } else if (message.type === 'system' && 'subtype' in message) {
      if (message.subtype === 'init') {
        console.log(`📋 Sessão iniciada: ${(message as any).session_id ?? ''}`)
      }
    } else if (message.type === 'assistant') {
      turns++
      const content = (message as any).message?.content ?? []
      for (const block of content) {
        if (block.type === 'text' && block.text?.trim()) {
          console.log(`\n[turno ${turns}] ${block.text.trim()}`)
        }
      }
    }
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
