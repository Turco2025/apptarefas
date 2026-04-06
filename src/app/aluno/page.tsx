'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MateriaBadge, TipoBadge, PriorityBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, diasParaVencer } from '@/lib/utils'
import { GraduationCap, ClipboardList, Search, Filter, X, LogOut, Calendar, Clock, AlertCircle, ChevronDown } from 'lucide-react'
import type { Turma, Tarefa } from '@/types'

interface ProfessorSimples { id: string; nome: string }
interface MateriaSimples { id: string; nome: string; cor: string }

export default function AlunoPage() {
  const router = useRouter()
  const [turma, setTurma] = useState<Turma | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [professores, setProfessores] = useState<ProfessorSimples[]>([])
  const [materias, setMaterias] = useState<MateriaSimples[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [fProfessor, setFProfessor] = useState('')
  const [fMateria, setFMateria] = useState('')
  const [fTipo, setFTipo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null)

  useEffect(() => {
    const t = sessionStorage.getItem('aluno_turma')
    if (!t) { router.push('/acesso-aluno'); return }
    const turmaData = JSON.parse(t)
    setTurma(turmaData)

    async function load() {
      const supabase = createClient()
      const { data: tars } = await supabase
        .from('tarefas')
        .select('*, professores(nome), materias(nome, cor)')
        .eq('turma_id', turmaData.id)
        .order('data_aula', { ascending: false })

      const { data: profs } = await supabase
        .from('professores').select('id, nome').eq('active', true).order('nome')
      const { data: mats } = await supabase
        .from('materias').select('id, nome, cor').eq('active', true).order('nome')

      setTarefas(tars || [])
      setProfessores(profs || [])
      setMaterias(mats || [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!t.titulo?.toLowerCase().includes(q) && !t.professores?.nome?.toLowerCase().includes(q)) return false
      }
      if (fProfessor && t.professor_id !== fProfessor) return false
      if (fMateria && t.materia_id !== fMateria) return false
      if (fTipo && t.tipo_tarefa !== fTipo) return false
      return true
    })
  }, [tarefas, busca, fProfessor, fMateria, fTipo])

  function sair() {
    sessionStorage.removeItem('aluno_turma')
    router.push('/acesso-aluno')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"/>
        <p className="text-slate-500">Carregando tarefas...</p>
      </div>
    </div>
  )

  if (!turma) return null

  const TIPOS = [...new Set(tarefas.map(t => t.tipo_tarefa))]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-xs text-slate-500">Visualizando como aluno</p>
              <h1 className="font-bold text-slate-900 text-base">{turma.nome}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
              {turma.serie} · {turma.turno}
            </span>
            <button onClick={sair} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4"/>
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Busca e filtros */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input type="text" placeholder="Buscar tarefa ou professor..." value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <Filter className="w-4 h-4"/>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
            </button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <select value={fProfessor} onChange={e => setFProfessor(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos os professores</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <select value={fMateria} onChange={e => setFMateria(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas as matérias</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <select value={fTipo} onChange={e => setFTipo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos os tipos</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</span>
          {(busca || fProfessor || fMateria || fTipo) && (
            <button onClick={() => { setBusca(''); setFProfessor(''); setFMateria(''); setFTipo('') }}
              className="flex items-center gap-1 text-indigo-600 hover:underline text-xs">
              <X className="w-3.5 h-3.5"/>Limpar filtros
            </button>
          )}
        </div>

        {/* Lista de tarefas */}
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nenhuma tarefa encontrada" description="Tente outros filtros ou aguarde novas tarefas do representante." />
        ) : (
          <div className="space-y-3">
            {filtered.map(t => {
              const dias = diasParaVencer(t.prazo_entrega)
              const urgente = dias !== null && dias <= 3
              return (
                <div key={t.id}
                  onClick={() => setSelectedTarefa(selectedTarefa?.id === t.id ? null : t)}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${urgente ? 'border-rose-200' : 'border-slate-100'}`}>
                  {urgente && <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-500"/>}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <TipoBadge tipo={t.tipo_tarefa}/>
                          <PriorityBadge prioridade={t.prioridade}/>
                          {t.materias && <MateriaBadge nome={t.materias.nome} cor={t.materias.cor}/>}
                        </div>
                        <h3 className="font-semibold text-slate-900">{t.titulo}</h3>
                        {t.professores && <p className="text-xs text-slate-500 mt-1">{t.professores.nome}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5"/>
                          {formatDate(t.data_aula)}
                        </div>
                        {t.prazo_entrega && (
                          <div className={`flex items-center gap-1 font-medium ${dias === 0 ? 'text-red-600' : urgente ? 'text-orange-600' : 'text-slate-500'}`}>
                            <Clock className="w-3.5 h-3.5"/>
                            {dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : formatDate(t.prazo_entrega)}
                            {urgente && <AlertCircle className="w-3 h-3"/>}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedTarefa?.id === t.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                        {t.descricao && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Descrição</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{t.descricao}</p>
                          </div>
                        )}
                        {t.observacoes && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Observações</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{t.observacoes}</p>
                          </div>
                        )}
                        {!t.descricao && !t.observacoes && (
                          <p className="text-sm text-slate-400">Sem detalhes adicionais.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
