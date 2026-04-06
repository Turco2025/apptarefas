'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge, MateriaBadge, TipoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, diasParaVencer } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import {
  ClipboardList, Plus, Search, Filter, X, Calendar, Clock,
  Edit2, Trash2, ChevronDown, Loader2, AlertCircle
} from 'lucide-react'
import type { Profile, Tarefa, Turma, Professor, Materia } from '@/types'

interface Props {
  profile: Profile
  initialTarefas: Tarefa[]
  turmas: Turma[]
  professores: Professor[]
  materias: Materia[]
}

const TIPOS = ['Tarefa','Prova','Trabalho','Projeto','Apresentação','Exercício','Seminário','Outro']
const PRIORIDADES = ['Baixa','Normal','Alta','Urgente']

export default function TarefasClient({ profile, initialTarefas, turmas, professores, materias }: Props) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(initialTarefas)
  const [showModal, setShowModal] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Filtros
  const [busca, setBusca] = useState('')
  const [fTurma, setFTurma] = useState('')
  const [fProfessor, setFProfessor] = useState('')
  const [fMateria, setFMateria] = useState('')
  const [fTipo, setFTipo] = useState('')
  const [fPrioridade, setFPrioridade] = useState('')
  const [fDataInicio, setFDataInicio] = useState('')
  const [fDataFim, setFDataFim] = useState('')

  // Form
  const emptyForm = {
    turma_id: profile.turma_id || '',
    professor_id: '', materia_id: '',
    titulo: '', descricao: '', observacoes: '',
    tipo_tarefa: 'Tarefa', prioridade: 'Normal',
    data_aula: '', prazo_entrega: '',
  }
  const [form, setForm] = useState(emptyForm)

  const canEdit = (t: Tarefa) => {
    if (profile.role === 'admin' || profile.role === 'coordinator') return true
    return t.criado_por_user_id === profile.id
  }

  // Tarefas filtradas
  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!t.titulo?.toLowerCase().includes(q) &&
            !t.descricao?.toLowerCase().includes(q) &&
            !t.professores?.nome?.toLowerCase().includes(q) &&
            !t.materias?.nome?.toLowerCase().includes(q)) return false
      }
      if (fTurma && t.turma_id !== fTurma) return false
      if (fProfessor && t.professor_id !== fProfessor) return false
      if (fMateria && t.materia_id !== fMateria) return false
      if (fTipo && t.tipo_tarefa !== fTipo) return false
      if (fPrioridade && t.prioridade !== fPrioridade) return false
      if (fDataInicio && t.data_aula < fDataInicio) return false
      if (fDataFim && t.data_aula > fDataFim) return false
      return true
    })
  }, [tarefas, busca, fTurma, fProfessor, fMateria, fTipo, fPrioridade, fDataInicio, fDataFim])

  const hasFilters = busca || fTurma || fProfessor || fMateria || fTipo || fPrioridade || fDataInicio || fDataFim

  function clearFilters() {
    setBusca(''); setFTurma(''); setFProfessor(''); setFMateria('')
    setFTipo(''); setFPrioridade(''); setFDataInicio(''); setFDataFim('')
  }

  function openNew() {
    setForm(emptyForm)
    setEditingTarefa(null)
    setSaveError(null)
    setShowModal(true)
  }

  function openEdit(t: Tarefa) {
    setForm({
      turma_id: t.turma_id, professor_id: t.professor_id,
      materia_id: t.materia_id, titulo: t.titulo,
      descricao: t.descricao || '', observacoes: t.observacoes || '',
      tipo_tarefa: t.tipo_tarefa, prioridade: t.prioridade,
      data_aula: t.data_aula, prazo_entrega: t.prazo_entrega || '',
    })
    setEditingTarefa(t)
    setSaveError(null)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()

    const payload = { ...form, prazo_entrega: form.prazo_entrega || null }

    if (editingTarefa) {
      const { data, error } = await supabase
        .from('tarefas')
        .update(payload)
        .eq('id', editingTarefa.id)
        .select('*, turmas(nome), professores(nome), materias(nome, cor), profiles(name)')
        .single()
      if (error) {
        setSaveError('Erro ao atualizar tarefa. Tente novamente.')
        setSaving(false)
        return
      }
      if (data) setTarefas(prev => prev.map(t => t.id === data.id ? data : t))
    } else {
      const { data, error } = await supabase
        .from('tarefas')
        .insert({ ...payload, criado_por_user_id: profile.id })
        .select('*, turmas(nome), professores(nome), materias(nome, cor), profiles(name)')
        .single()
      if (error) {
        setSaveError('Erro ao criar tarefa. Tente novamente.')
        setSaving(false)
        return
      }
      if (data) setTarefas(prev => [data, ...prev])
    }
    setSaving(false)
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirmar exclusão desta tarefa?')) return
    setDeletingId(id)
    setDeleteError(null)
    const supabase = createClient()
    const { error } = await supabase.from('tarefas').delete().eq('id', id)
    if (error) {
      setDeleteError('Erro ao excluir tarefa. Tente novamente.')
      setDeletingId(null)
      return
    }
    setTarefas(prev => prev.filter(t => t.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Tarefas" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tarefas</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} tarefas encontradas</p>
        </div>
        {(profile.role === 'representative' || profile.role === 'admin') && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        )}
      </div>

      {/* Erro de exclusão */}
      {deleteError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Busca + Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, professor, matéria..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || hasFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasFilters && <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">!</span>}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Limpar filtros">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            {profile.role !== 'representative' && (
              <select value={fTurma} onChange={e => setFTurma(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas as turmas</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            )}
            <select value={fProfessor} onChange={e => setFProfessor(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos os professores</option>
              {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select value={fMateria} onChange={e => setFMateria(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas as matérias</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <select value={fTipo} onChange={e => setFTipo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos os tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={fPrioridade} onChange={e => setFPrioridade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas as prioridades</option>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" value={fDataInicio} onChange={e => setFDataInicio(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="date" value={fDataFim} onChange={e => setFDataFim(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        )}
      </div>

      {/* Lista de tarefas */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa encontrada"
          description="Tente ajustar os filtros ou adicione uma nova tarefa."
          action={
            profile.role === 'representative' && (
              <button onClick={openNew} className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25">
                Adicionar Tarefa
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map(t => {
            const dias = diasParaVencer(t.prazo_entrega)
            const prazoUrgente = dias !== null && dias <= 3
            const professor = t.professores
            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                  prazoUrgente ? 'border-rose-200' : 'border-slate-100'
                }`}
              >
                {prazoUrgente && (
                  <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <TipoBadge tipo={t.tipo_tarefa} />
                        <PriorityBadge prioridade={t.prioridade} />
                        {t.materias && <MateriaBadge nome={t.materias.nome} cor={t.materias.cor} />}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base">{t.titulo}</h3>
                      {t.descricao && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.descricao}</p>}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {professor && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">P</span>
                            {professor.nome}
                          </span>
                        )}
                        {t.turmas && (
                          <span className="text-xs text-slate-500">{t.turmas.nome}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(t.data_aula)}
                      </div>
                      {t.prazo_entrega && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          dias === 0 ? 'text-red-600' : prazoUrgente ? 'text-orange-600' : 'text-slate-500'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          Prazo: {formatDate(t.prazo_entrega)}
                          {prazoUrgente && <AlertCircle className="w-3.5 h-3.5" />}
                        </div>
                      )}
                      {canEdit(t) && (
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Nova/Editar Tarefa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">
                {editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.role !== 'representative' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma *</label>
                    <select required value={form.turma_id} onChange={e => setForm({...form, turma_id: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecionar turma</option>
                      {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Professor *</label>
                  <select required value={form.professor_id} onChange={e => setForm({...form, professor_id: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Selecionar professor</option>
                    {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Matéria *</label>
                  <select required value={form.materia_id} onChange={e => setForm({...form, materia_id: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Selecionar matéria</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo *</label>
                  <select required value={form.tipo_tarefa} onChange={e => setForm({...form, tipo_tarefa: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridade</label>
                  <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Data da Aula *</label>
                  <input type="date" required value={form.data_aula} onChange={e => setForm({...form, data_aula: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prazo de Entrega</label>
                  <input type="date" value={form.prazo_entrega} onChange={e => setForm({...form, prazo_entrega: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
                <input type="text" required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
                  placeholder="Ex: Lista de exercícios capítulo 5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea rows={3} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                  placeholder="Detalhes sobre a tarefa..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
                <textarea rows={2} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : editingTarefa ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
