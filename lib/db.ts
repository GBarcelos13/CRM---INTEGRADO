import { supabase } from './supabase'
import type { Lead, Task, LeadStatus } from './mockData'

// ─── DB row shapes (snake_case) ──────────────────────────────────────────────

interface DBLead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  origin: string
  status: string
  value: number
  tags: string[]
  assignee: string
  avatar: string
  last_contact: string
  created_at: string
}

interface DBInteraction {
  id: string
  lead_id: string
  type: string
  description: string
  date: string
  user_name: string
}

interface DBTask {
  id: string
  title: string
  lead_id: string | null
  lead_name: string | null
  contact_phone: string | null
  contact_email: string | null
  due_date: string
  completed: boolean
  priority: string
  type: string
  leads?: { email: string | null; phone: string | null } | null
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function fetchLeads(): Promise<Lead[]> {
  const [{ data: leads, error: leadsErr }, { data: interactions, error: intErr }] =
    await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('date', { ascending: true }),
    ])

  if (leadsErr) throw leadsErr
  if (intErr) throw intErr

  const byLead: Record<string, DBInteraction[]> = {}
  for (const i of (interactions ?? []) as DBInteraction[]) {
    if (!byLead[i.lead_id]) byLead[i.lead_id] = []
    byLead[i.lead_id].push(i)
  }

  return ((leads ?? []) as DBLead[]).map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    company: l.company,
    origin: l.origin as Lead['origin'],
    status: l.status as Lead['status'],
    value: l.value,
    tags: l.tags ?? [],
    assignee: l.assignee,
    avatar: l.avatar,
    lastContact: l.last_contact,
    createdAt: l.created_at,
    interactions: (byLead[l.id] ?? []).map((i) => ({
      id: i.id,
      type: i.type as Lead['interactions'][0]['type'],
      description: i.description,
      date: i.date,
      user: i.user_name,
    })),
  }))
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, leads(email, phone)')
    .order('due_date', { ascending: true })

  if (error) throw error

  return ((data ?? []) as DBTask[]).map((t) => ({
    id: t.id,
    title: t.title,
    leadId: t.lead_id ?? undefined,
    leadName: t.lead_name ?? undefined,
    leadEmail: t.leads?.email ?? t.contact_email ?? undefined,
    leadPhone: t.leads?.phone ?? t.contact_phone ?? undefined,
    dueDate: t.due_date,
    completed: t.completed,
    priority: t.priority as Task['priority'],
    type: t.type as Task['type'],
  }))
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)
  if (error) throw error
}

export async function toggleTask(taskId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
  if (error) throw error
}

export async function createLead(data: {
  name: string
  company: string
  email: string
  phone: string
  origin: Lead['origin']
  status: LeadStatus
  value: number
  assignee: string
}): Promise<Lead> {
  const id = crypto.randomUUID()
  const words = data.name.trim().split(/\s+/)
  const avatar =
    words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase()
  const now = new Date().toISOString()

  const { error } = await supabase.from('leads').insert({
    id,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    status: data.status,
    value: data.value,
    assignee: data.assignee,
    avatar,
    tags: [],
    last_contact: now,
    created_at: now,
  })
  if (error) throw error

  return {
    id,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    status: data.status,
    value: data.value,
    assignee: data.assignee,
    avatar,
    tags: [],
    lastContact: now,
    createdAt: now,
    interactions: [],
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', leadId)
  if (error) throw error
}

export async function createTask(data: {
  title: string
  type: Task['type']
  priority: Task['priority']
  dueDate: string
  leadId?: string
  leadName?: string
  leadEmail?: string
  leadPhone?: string
}): Promise<Task> {
  const id = crypto.randomUUID()
  const { error } = await supabase.from('tasks').insert({
    id,
    title: data.title,
    type: data.type,
    priority: data.priority,
    due_date: data.dueDate,
    completed: false,
    lead_id: data.leadId ?? null,
    lead_name: data.leadName ?? null,
    contact_phone: data.leadPhone ?? null,
    contact_email: data.leadEmail ?? null,
  })
  if (error) throw error

  return {
    id,
    title: data.title,
    type: data.type,
    priority: data.priority,
    dueDate: data.dueDate,
    completed: false,
    leadId: data.leadId,
    leadName: data.leadName,
    leadEmail: data.leadEmail,
    leadPhone: data.leadPhone,
  }
}
