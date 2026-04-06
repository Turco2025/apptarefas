'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MateriaBadge, TipoBadge, PriorityBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react'
import type { Profile, Tarefa } from '@/types'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

interface Props {
  profile: Profile
  tarefas: Tarefa[]
}

export default function CalendarioClient({ profile, tarefas }: Props) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const today = new Date().toISOString().split('T')[0]

  // Mapa de tarefas por data
  const tarefasPorData = useMemo(() => {
    const map: Record<string, Tarefa[]> = {}
    tarefas.forEach(t => {
      if (!map[t.data_aula]) map[t.data_aula] = []
      map[t.data_aula].push(t)
    })
    return map
  }, [tarefas])

  // Semana atual
  function getWeekDays(date: Date) {
    const start = new Date(date)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  // Dias do mês
  function getMonthDays(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function prevPeriod() {
    const d = new Date(currentDate)
    if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }
  function nextPeriod() {
    const d = new Date(currentDate)
    if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }
  function goToday() { setCurrentDate(new Date()) }

  function toDateStr(d: Date) {
    return d.toISOString().split('T')[0]
  }

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate)
  const selectedTarefas = selectedDate ? (tarefasPorData[selectedDate] || []) : []

  const periodLabel = viewMode === 'week'
    ? `${weekDays[0].getDate()} – ${weekDays[6].getDate()} de ${MESES[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`
    : `${MESES[currentDate.getMonth()]} ${currentDate.getFullYear()}`

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile as Profile} title="Calendário" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900">Calendário de Tarefas</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >Semana</button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >Mês</button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
        <button onClick={prevPeriod} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="font-semibold text-slate-900">{periodLabel}</h3>
          <button onClick={goToday} className="text-xs text-indigo-600 hover:underline mt-0.5">Hoje</button>
        </div>
        <button onClick={nextPeriod} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          {viewMode === 'week' ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7">
                {DIAS.map(d => (
                  <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                    {d}
                  </div>
                ))}
                {weekDays.map(d => {
                  const ds = toDateStr(d)
                  const count = tarefasPorData[ds]?.length || 0
                  const isToday = ds === today
                  const isSelected = ds === selectedDate
                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(isSelected ? null : ds)}
                      className={`p-3 flex flex-col items-center gap-2 transition-all border-r last:border-r-0 border-slate-50 hover:bg-indigo-50 ${
                        isSelected ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                        isToday
                          ? 'gradient-primary text-white shadow-md shadow-indigo-500/30'
                          : isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-slate-700 hover:bg-indigo-100'
                      }`}>
                        {d.getDate()}
                      </span>
                      {count > 0 && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                      {count === 0 && <span className="h-5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7">
                {DIAS.map(d => (
                  <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                    {d}
                  </div>
                ))}
                {monthDays.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} className="h-16 border-b border-r border-slate-50" />
                  const ds = toDateStr(d)
                  const count = tarefasPorData[ds]?.length || 0
                  const isToday = ds === today
                  const isSelected = ds === selectedDate
                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(isSelected ? null : ds)}
                      className={`h-16 p-2 flex flex-col items-start border-b border-r last:border-r-0 border-slate-50 hover:bg-indigo-50 transition-all ${
                        isSelected ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold mb-1 ${
                        isToday ? 'gradient-primary text-white' : isSelected ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700'
                      }`}>
                        {d.getDate()}
                      </span>
                      {count > 0 && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel lateral — tarefas do dia */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              {selectedDate ? formatDate(selectedDate) : 'Selecione um dia'}
            </h3>
            <div className="flex gap-2">
              {selectedDate && profile.role === 'representative' && (
                <button
                  onClick={() => router.push(`/dashboard/tarefas?data=${selectedDate}`)}
                  className="p-1.5 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                  title="Adicionar tarefa"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {!selectedDate ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Clique em um dia para ver as tarefas</p>
              </div>
            ) : selectedTarefas.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-slate-400">Nenhuma tarefa neste dia</p>
                {profile.role === 'representative' && (
                  <button
                    onClick={() => router.push(`/dashboard/tarefas?data=${selectedDate}`)}
                    className="mt-3 text-sm text-indigo-600 hover:underline font-medium"
                  >
                    + Adicionar tarefa
                  </button>
                )}
              </div>
            ) : (
              selectedTarefas.map((t: Tarefa) => (
                <div key={t.id} className="px-5 py-4">
                  <div className="flex items-start gap-2 mb-2">
                    <TipoBadge tipo={t.tipo_tarefa} />
                    <PriorityBadge prioridade={t.prioridade} />
                  </div>
                  <p className="font-medium text-slate-900 text-sm">{t.titulo}</p>
                  {t.materias && <div className="mt-1.5"><MateriaBadge nome={t.materias.nome} cor={t.materias.cor} /></div>}
                  {t.professores && <p className="text-xs text-slate-500 mt-1">{t.professores.nome}</p>}
                  {t.prazo_entrega && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      Prazo: {formatDate(t.prazo_entrega)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
