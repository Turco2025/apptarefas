import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/ui/Card'
import { PriorityBadge, MateriaBadge, TipoBadge } from '@/components/ui/Badge'
import { formatDate, diasParaVencer } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import {
  School, Users, BookOpen, ClipboardList,
  Calendar, CalendarDays, CalendarRange,
  Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import type { Profile, Tarefa } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const startWeek = new Date()
  startWeek.setDate(startWeek.getDate() - startWeek.getDay())
  const endWeek = new Date(startWeek)
  endWeek.setDate(startWeek.getDate() + 6)
  const startMonth = today.substring(0, 8) + '01'
  const endMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

  // Filtro por turma se for representante
  const turmaFilter = profile.role === 'representative' && profile.turma_id
    ? profile.turma_id : null

  async function count(table: string) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('active', true)
    return count || 0
  }

  const [totalTurmas, totalProfessores, totalMaterias] = await Promise.all([
    count('turmas'), count('professores'), count('materias')
  ])

  const { count: totalRepresentantes } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
    .eq('role', 'representative').eq('active', true)

  // Tarefas por período
  function tarefasQuery() {
    let q = supabase.from('tarefas').select('*', { count: 'exact', head: true })
    if (turmaFilter) q = q.eq('turma_id', turmaFilter)
    return q
  }

  const [{ count: tarefasHoje }, { count: tarefasSemana }, { count: tarefasMes }] = await Promise.all([
    tarefasQuery().eq('data_aula', today),
    tarefasQuery().gte('data_aula', startWeek.toISOString().split('T')[0]).lte('data_aula', endWeek.toISOString().split('T')[0]),
    tarefasQuery().gte('data_aula', startMonth).lte('data_aula', endMonth),
  ])

  // Próximas tarefas
  let proximasQuery = supabase
    .from('tarefas')
    .select('*, turmas(nome), professores(nome), materias(nome, cor)')
    .gte('data_aula', today)
    .order('data_aula', { ascending: true })
    .limit(6)
  if (turmaFilter) proximasQuery = proximasQuery.eq('turma_id', turmaFilter)
  const { data: proximasTarefas } = await proximasQuery

  // Tarefas urgentes / prazo próximo
  const prazoLimite = new Date()
  prazoLimite.setDate(prazoLimite.getDate() + 3)
  let urgentesQuery = supabase
    .from('tarefas')
    .select('*, turmas(nome), materias(nome, cor)')
    .lte('prazo_entrega', prazoLimite.toISOString().split('T')[0])
    .gte('prazo_entrega', today)
    .order('prazo_entrega', { ascending: true })
    .limit(5)
  if (turmaFilter) urgentesQuery = urgentesQuery.eq('turma_id', turmaFilter)
  const { data: urgentes } = await urgentesQuery

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <TopBar profile={profile as Profile} />

      {/* Saudação */}
      <div className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {new Date().getHours() < 12 ? '☀️ Bom dia' : new Date().getHours() < 18 ? '🌤 Boa tarde' : '🌙 Boa noite'}, {profile.name.split(' ')[0]}!
        </h2>
        <p className="text-slate-500 mt-1">
          Aqui está o resumo do sistema escolar para hoje, {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(profile.role === 'admin' || profile.role === 'coordinator') && (
          <>
            <StatCard title="Turmas Ativas" value={totalTurmas} icon={School} color="indigo" subtitle="no sistema" />
            <StatCard title="Professores" value={totalProfessores} icon={Users} color="emerald" subtitle="ativos" />
            <StatCard title="Matérias" value={totalMaterias} icon={BookOpen} color="cyan" subtitle="cadastradas" />
            <StatCard title="Representantes" value={totalRepresentantes || 0} icon={Users} color="purple" subtitle="ativos" />
          </>
        )}
        <StatCard title="Tarefas Hoje" value={tarefasHoje || 0} icon={Calendar} color="amber" subtitle={formatDate(today)} />
        <StatCard title="Esta Semana" value={tarefasSemana || 0} icon={CalendarDays} color="rose" subtitle="tarefas" />
        <StatCard title="Este Mês" value={tarefasMes || 0} icon={CalendarRange} color="orange" subtitle="tarefas" />
        {(urgentes?.length || 0) > 0 && (
          <StatCard title="Prazo Próximo" value={urgentes?.length || 0} icon={AlertCircle} color="rose" subtitle="nos próximos 3 dias" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas tarefas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Próximas Tarefas</h3>
            </div>
            <span className="text-xs text-slate-400">{proximasTarefas?.length || 0} tarefas</span>
          </div>
          <div className="divide-y divide-slate-50">
            {proximasTarefas && proximasTarefas.length > 0 ? (
              proximasTarefas.map((t: Tarefa) => (
                <div key={t.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{t.titulo}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {t.turmas && <span className="text-xs text-slate-500">{t.turmas.nome}</span>}
                        {t.materias && <MateriaBadge nome={t.materias.nome} cor={t.materias.cor} />}
                        <TipoBadge tipo={t.tipo_tarefa} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <PriorityBadge prioridade={t.prioridade} />
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(t.data_aula)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Nenhuma tarefa próxima</p>
              </div>
            )}
          </div>
        </div>

        {/* Prazos urgentes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-slate-900">Prazos Urgentes</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {urgentes && urgentes.length > 0 ? (
              urgentes.map((t: Tarefa) => {
                const dias = diasParaVencer(t.prazo_entrega)
                return (
                  <div key={t.id} className="px-6 py-4">
                    <p className="font-medium text-slate-900 text-sm truncate">{t.titulo}</p>
                    {t.materias && (
                      <div className="mt-1">
                        <MateriaBadge nome={t.materias.nome} cor={t.materias.cor} />
                      </div>
                    )}
                    <div className={`mt-2 text-xs font-semibold ${
                      dias === 0 ? 'text-red-600' : dias === 1 ? 'text-orange-600' : 'text-amber-600'
                    }`}>
                      {dias === 0 ? '🔴 Entrega HOJE' : dias === 1 ? '🟠 Amanhã' : `🟡 Em ${dias} dias`}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Nenhum prazo urgente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
