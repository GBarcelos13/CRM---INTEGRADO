import { fetchLeads, fetchTasks, createLead, deleteLead, updateLeadStatus, toggleTask, createTask } from '@/lib/db'

jest.setTimeout(15000)

// ─── fetchLeads ───────────────────────────────────────────────────────────────

describe('fetchLeads', () => {
  it('retorna um array', async () => {
    const leads = await fetchLeads()
    expect(Array.isArray(leads)).toBe(true)
  })

  it('retorna ao menos um lead', async () => {
    const leads = await fetchLeads()
    expect(leads.length).toBeGreaterThan(0)
  })

  it('cada lead tem as propriedades obrigatórias', async () => {
    const leads = await fetchLeads()
    for (const lead of leads) {
      expect(lead).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        status: expect.any(String),
        origin: expect.any(String),
        value: expect.any(Number),
        interactions: expect.any(Array),
      })
    }
  })

  it('status dos leads são valores válidos', async () => {
    const valid = ['novo', 'em_atendimento', 'proposta', 'fechado_ganho', 'fechado_perdido']
    const leads = await fetchLeads()
    for (const lead of leads) {
      expect(valid).toContain(lead.status)
    }
  })
})

// ─── fetchTasks ───────────────────────────────────────────────────────────────

describe('fetchTasks', () => {
  it('retorna um array', async () => {
    const tasks = await fetchTasks()
    expect(Array.isArray(tasks)).toBe(true)
  })

  it('cada tarefa tem as propriedades obrigatórias', async () => {
    const tasks = await fetchTasks()
    for (const task of tasks) {
      expect(task).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        dueDate: expect.any(String),
        completed: expect.any(Boolean),
        priority: expect.any(String),
        type: expect.any(String),
      })
    }
  })

  it('priority tem valor válido', async () => {
    const valid = ['alta', 'media', 'baixa']
    const tasks = await fetchTasks()
    for (const task of tasks) {
      expect(valid).toContain(task.priority)
    }
  })
})

// ─── createLead + deleteLead ──────────────────────────────────────────────────

describe('createLead + deleteLead', () => {
  let createdId: string | null = null

  afterEach(async () => {
    if (createdId) {
      await deleteLead(createdId).catch(() => {})
      createdId = null
    }
  })

  it('cria um lead e retorna com id', async () => {
    const lead = await createLead({
      name: 'TESTE_AGENT_Lead',
      company: 'Empresa Teste',
      email: 'teste@agent.com',
      phone: '(11) 00000-0000',
      origin: 'site',
      status: 'novo',
      value: 999,
      assignee: 'Agente',
    })
    createdId = lead.id
    expect(lead.id).toBeTruthy()
    expect(lead.name).toBe('TESTE_AGENT_Lead')
    expect(lead.avatar).toBeTruthy() // initials geradas automaticamente
  })

  it('lead criado aparece no fetchLeads', async () => {
    const lead = await createLead({
      name: 'TESTE_AGENT_Busca',
      company: '',
      email: '',
      phone: '',
      origin: 'site',
      status: 'novo',
      value: 0,
      assignee: '',
    })
    createdId = lead.id
    const all = await fetchLeads()
    expect(all.some((l) => l.id === lead.id)).toBe(true)
  })

  it('deleteLead remove o lead do banco', async () => {
    const lead = await createLead({
      name: 'TESTE_AGENT_Delete',
      company: '',
      email: '',
      phone: '',
      origin: 'site',
      status: 'novo',
      value: 0,
      assignee: '',
    })
    await deleteLead(lead.id)
    createdId = null
    const all = await fetchLeads()
    expect(all.some((l) => l.id === lead.id)).toBe(false)
  })
})

// ─── updateLeadStatus ─────────────────────────────────────────────────────────

describe('updateLeadStatus', () => {
  let createdId: string | null = null

  afterEach(async () => {
    if (createdId) {
      await deleteLead(createdId).catch(() => {})
      createdId = null
    }
  })

  it('atualiza o status de um lead', async () => {
    const lead = await createLead({
      name: 'TESTE_AGENT_Status',
      company: '',
      email: '',
      phone: '',
      origin: 'site',
      status: 'novo',
      value: 0,
      assignee: '',
    })
    createdId = lead.id

    await updateLeadStatus(lead.id, 'proposta')

    const all = await fetchLeads()
    const updated = all.find((l) => l.id === lead.id)
    expect(updated?.status).toBe('proposta')
  })
})

// ─── createTask ───────────────────────────────────────────────────────────────

describe('createTask', () => {
  let createdId: string | null = null

  afterEach(async () => {
    if (createdId) {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('tasks').delete().eq('id', createdId)
      createdId = null
    }
  })

  it('cria uma tarefa sem lead e retorna com id', async () => {
    const task = await createTask({
      title: 'TESTE_AGENT_Task',
      type: 'ligacao',
      priority: 'alta',
      dueDate: '2026-12-31',
    })
    createdId = task.id
    expect(task.id).toBeTruthy()
    expect(task.title).toBe('TESTE_AGENT_Task')
    expect(task.completed).toBe(false)
  })

  it('tarefa criada aparece no fetchTasks', async () => {
    const task = await createTask({
      title: 'TESTE_AGENT_Task_Busca',
      type: 'email',
      priority: 'media',
      dueDate: '2026-12-31',
    })
    createdId = task.id
    const all = await fetchTasks()
    expect(all.some((t) => t.id === task.id)).toBe(true)
  })

  it('cria tarefa com lead vinculado', async () => {
    const leads = await fetchLeads()
    const lead = leads[0]
    const task = await createTask({
      title: 'TESTE_AGENT_Task_Lead',
      type: 'reuniao',
      priority: 'baixa',
      dueDate: '2026-12-31',
      leadId: lead.id,
      leadName: lead.name,
    })
    createdId = task.id
    expect(task.leadId).toBe(lead.id)
    expect(task.leadName).toBe(lead.name)
  })
})

// ─── toggleTask ───────────────────────────────────────────────────────────────

describe('toggleTask', () => {
  it('altera o campo completed de uma tarefa existente', async () => {
    const tasks = await fetchTasks()
    expect(tasks.length).toBeGreaterThan(0)

    const task = tasks[0]
    const original = task.completed

    await toggleTask(task.id, !original)
    const after = await fetchTasks()
    const changed = after.find((t) => t.id === task.id)
    expect(changed?.completed).toBe(!original)

    // Restaurar
    await toggleTask(task.id, original)
  })
})
