'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Phone, Mail, Users, ArrowRight, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { type Task, type TaskType, formatDate } from '@/lib/mockData'
import { fetchTasks, toggleTask } from '@/lib/db'
import NewTaskModal from '@/components/NewTaskModal'

type TabValue = 'todas' | 'hoje' | 'atrasadas' | 'concluidas'

const TODAY = new Date().toISOString().slice(0, 10)

function isToday(dateStr: string): boolean {
  return dateStr.startsWith(TODAY)
}

function isOverdue(dateStr: string, completed: boolean): boolean {
  if (completed) return false
  return dateStr.slice(0, 10) < TODAY
}

function isFuture(dateStr: string): boolean {
  return dateStr.slice(0, 10) > TODAY
}

const typeIcons: Record<TaskType, React.ElementType> = {
  ligacao: Phone,
  email: Mail,
  reuniao: Users,
  follow_up: ArrowRight,
}

const typeLabels: Record<TaskType, string> = {
  ligacao: 'Ligação',
  email: 'Email',
  reuniao: 'Reunião',
  follow_up: 'Follow-up',
}

const typeColors: Record<TaskType, string> = {
  ligacao: 'bg-emerald-100 text-emerald-600',
  email: 'bg-blue-100 text-blue-600',
  reuniao: 'bg-purple-100 text-purple-600',
  follow_up: 'bg-amber-100 text-amber-600',
}

const priorityConfig = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-700' },
  media: { label: 'Média', className: 'bg-amber-100 text-amber-700' },
  baixa: { label: 'Baixa', className: 'bg-slate-100 text-slate-600' },
}

interface TaskRowProps {
  task: Task
  onToggle: (id: string) => void
}

function TaskRow({ task, onToggle }: TaskRowProps) {
  const overdue = isOverdue(task.dueDate, task.completed)
  const Icon = typeIcons[task.type]
  const pCfg = priorityConfig[task.priority]
  const typeCfg = typeColors[task.type]

  return (
    <li
      className={clsx(
        'flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors duration-100 border-l-2',
        task.completed
          ? 'border-slate-100 opacity-60'
          : overdue
          ? 'border-red-400'
          : 'border-transparent'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={clsx(
          'flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-all duration-150',
          task.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 hover:border-blue-500'
        )}
        aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
      >
        {task.completed && (
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className={clsx('flex items-center justify-center w-7 h-7 rounded-lg shrink-0', typeCfg)}>
        <Icon size={13} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium leading-tight', task.completed ? 'line-through text-slate-400' : 'text-slate-800')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-slate-500">{typeLabels[task.type]}</span>
          {task.leadName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              {task.leadName}
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className={clsx('text-xs font-medium', task.completed ? 'text-slate-400' : overdue ? 'text-red-600' : 'text-slate-600')}>
          {isToday(task.dueDate) ? 'Hoje' : formatDate(task.dueDate)}
        </span>
      </div>

      <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0', pCfg.className)}>
        {pCfg.label}
      </span>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {task.leadPhone ? (
          <a
            href={`tel:${task.leadPhone}`}
            title={`Ligar: ${task.leadPhone}`}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-150"
          >
            <Phone size={13} />
          </a>
        ) : (
          <span
            title="Telefone não cadastrado"
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-300 cursor-not-allowed"
          >
            <Phone size={13} />
          </span>
        )}
        {task.leadEmail ? (
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(task.leadEmail)}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Email: ${task.leadEmail}`}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150"
          >
            <Mail size={13} />
          </a>
        ) : (
          <span
            title="Email não cadastrado"
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-300 cursor-not-allowed"
          >
            <Mail size={13} />
          </span>
        )}
      </div>
    </li>
  )
}

interface TaskSectionProps {
  title: string
  tasks: Task[]
  onToggle: (id: string) => void
  headerClass?: string
  icon?: React.ElementType
  emptyMessage?: string
}

function TaskSection({ title, tasks, onToggle, headerClass = 'text-slate-700', icon: HeaderIcon }: TaskSectionProps) {
  if (tasks.length === 0) return null

  return (
    <section>
      <div className={clsx('flex items-center gap-2 mb-2 px-1', headerClass)}>
        {HeaderIcon && <HeaderIcon size={15} />}
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-slate-400">({tasks.length})</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<TabValue>('todas')
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  useEffect(() => {
    fetchTasks().then(setTasks).catch(console.error)
  }, [])

  const handleTaskAdd = (task: Task) => {
    setTasks((prev) => [...prev, task])
    setTaskModalOpen(false)
  }

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const newCompleted = !t.completed
        toggleTask(id, newCompleted).catch(console.error)
        return { ...t, completed: newCompleted }
      })
    )
  }

  const { overdueTasks, todayTasks, futureTasks, completedTasks } = useMemo(() => {
    const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.completed))
    const todayTasks = tasks.filter((t) => !t.completed && isToday(t.dueDate))
    const futureTasks = tasks.filter((t) => !t.completed && isFuture(t.dueDate))
    const completedTasks = tasks.filter((t) => t.completed)
    return { overdueTasks, todayTasks, futureTasks, completedTasks }
  }, [tasks])

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: 'Todas', value: 'todas', count: tasks.filter((t) => !t.completed).length },
    { label: 'Hoje', value: 'hoje', count: todayTasks.length },
    { label: 'Atrasadas', value: 'atrasadas', count: overdueTasks.length },
    { label: 'Concluídas', value: 'concluidas', count: completedTasks.length },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'atrasadas':
        return <TaskSection title="Atrasadas" tasks={overdueTasks} onToggle={handleToggle} headerClass="text-red-600" icon={AlertCircle} />
      case 'hoje':
        return <TaskSection title="Para Hoje" tasks={todayTasks} onToggle={handleToggle} headerClass="text-blue-700" icon={Clock} />
      case 'concluidas':
        return <TaskSection title="Concluídas" tasks={completedTasks} onToggle={handleToggle} headerClass="text-emerald-700" icon={CheckSquare} />
      default:
        return (
          <div className="space-y-5">
            <TaskSection title="Atrasadas" tasks={overdueTasks} onToggle={handleToggle} headerClass="text-red-600" icon={AlertCircle} />
            <TaskSection title="Hoje" tasks={todayTasks} onToggle={handleToggle} headerClass="text-blue-700" icon={Clock} />
            <TaskSection title="Próximas" tasks={futureTasks} onToggle={handleToggle} headerClass="text-slate-700" />
          </div>
        )
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Tarefas</h1>
          {overdueTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              <AlertCircle size={11} />
              {overdueTasks.length} atrasada{overdueTasks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button onClick={() => setTaskModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm">
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
              activeTab === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={clsx(
                  'inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-xs font-bold',
                  activeTab === tab.value
                    ? 'bg-white/20 text-white'
                    : tab.value === 'atrasadas'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task sections */}
      {renderContent()}

      {activeTab === 'todas' && completedTasks.length > 0 && (
        <TaskSection title="Concluídas" tasks={completedTasks} onToggle={handleToggle} headerClass="text-emerald-700" icon={CheckSquare} />
      )}

      {activeTab !== 'todas' &&
        ((activeTab === 'hoje' && todayTasks.length === 0) ||
          (activeTab === 'atrasadas' && overdueTasks.length === 0) ||
          (activeTab === 'concluidas' && completedTasks.length === 0)) && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <CheckSquare size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm font-medium">
              {activeTab === 'concluidas'
                ? 'Nenhuma tarefa concluída ainda'
                : activeTab === 'atrasadas'
                ? 'Nenhuma tarefa atrasada!'
                : 'Nenhuma tarefa para hoje'}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {activeTab === 'atrasadas'
                ? 'Excelente! Você está em dia com todas as tarefas.'
                : 'Aproveite para planejar as próximas ações.'}
            </p>
          </div>
        )}
      {taskModalOpen && (
        <NewTaskModal
          onClose={() => setTaskModalOpen(false)}
          onAdd={handleTaskAdd}
        />
      )}
    </div>
  )
}
