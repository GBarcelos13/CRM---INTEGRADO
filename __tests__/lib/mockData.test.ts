import {
  isLeadForgotten,
  formatCurrency,
  formatDate,
  formatRelativeDate,
  type Lead,
} from '@/lib/mockData'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-1',
    name: 'Teste',
    email: 'teste@teste.com',
    phone: '(11) 99999-9999',
    company: 'Empresa Teste',
    origin: 'site',
    status: 'novo',
    value: 1000,
    tags: [],
    assignee: 'Ana',
    avatar: 'TE',
    lastContact: daysAgo(1),
    createdAt: daysAgo(10),
    interactions: [],
    ...overrides,
  }
}

// ─── isLeadForgotten ──────────────────────────────────────────────────────────

describe('isLeadForgotten', () => {
  it('retorna false quando contato foi há menos de 7 dias', () => {
    expect(isLeadForgotten(makeLead({ lastContact: daysAgo(3) }))).toBe(false)
  })

  it('retorna true quando contato foi há mais de 7 dias', () => {
    expect(isLeadForgotten(makeLead({ lastContact: daysAgo(8) }))).toBe(true)
  })

  it('retorna false para status fechado_ganho mesmo sem contato', () => {
    expect(
      isLeadForgotten(makeLead({ status: 'fechado_ganho', lastContact: daysAgo(30) }))
    ).toBe(false)
  })

  it('retorna false para status fechado_perdido mesmo sem contato', () => {
    expect(
      isLeadForgotten(makeLead({ status: 'fechado_perdido', lastContact: daysAgo(30) }))
    ).toBe(false)
  })

  it('retorna false com contato exatamente hoje', () => {
    expect(isLeadForgotten(makeLead({ lastContact: daysAgo(0) }))).toBe(false)
  })
})

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata valor inteiro em reais', () => {
    expect(formatCurrency(1000)).toContain('1.000')
  })

  it('formata zero', () => {
    expect(formatCurrency(0)).toContain('0')
  })

  it('formata valor alto', () => {
    expect(formatCurrency(45000)).toContain('45.000')
  })

  it('retorna string com símbolo R$', () => {
    expect(formatCurrency(100)).toMatch(/R\$/)
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formata data no padrão DD/MM/YYYY', () => {
    expect(formatDate('2026-03-23T10:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('contém o ano correto', () => {
    expect(formatDate('2026-03-23T10:00:00.000Z')).toContain('2026')
  })
})

// ─── formatRelativeDate ───────────────────────────────────────────────────────

describe('formatRelativeDate', () => {
  it('retorna "Hoje" para data de hoje', () => {
    expect(formatRelativeDate(daysAgo(0))).toBe('Hoje')
  })

  it('retorna "Ontem" para data de ontem', () => {
    expect(formatRelativeDate(daysAgo(1))).toBe('Ontem')
  })

  it('retorna "X dias atrás" para datas recentes', () => {
    expect(formatRelativeDate(daysAgo(3))).toBe('3 dias atrás')
  })

  it('retorna "Amanhã" para data de amanhã', () => {
    expect(formatRelativeDate(daysFromNow(1))).toBe('Amanhã')
  })

  it('retorna "Em X dias" para datas futuras', () => {
    expect(formatRelativeDate(daysFromNow(5))).toBe('Em 5 dias')
  })

  it('retorna "1 semana atrás" para 7-13 dias', () => {
    expect(formatRelativeDate(daysAgo(8))).toBe('1 semana atrás')
  })
})
