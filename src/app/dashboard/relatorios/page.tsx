'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { MateriaBadge } from '@/components/ui/Badge'
import { FileText, Download, Filter, BarChart3, TrendingUp, School, Users, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Profile, Tarefa } from '@/types'

type ItemSimples = { id: string; nome: string }
type MateriaSimples = { id: string; nome: string; cor: string }

export default function RelatoriosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [turmas, setTurmas] = useState<ItemSimples[]>([])
  const [professores, setProfessores] = useState<ItemSimples[]>([])
  const [materias, setMaterias] = useState<MateriaSimples[]>([])
  const [fTurma, setFTurma] = useState('')
  const [fProfessor, setFProfessor] = useState('')
  const [fMateria, setFMateria] = useState('')
  const [fMes, setFMes] = useState('')
  const [fAno, setFAno] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const [{ data: t }, { data: profs }, { data: mats }, { data: tar }] = await Promise.all([
        supabase.from('turmas').select('id, nome').eq('active', true).order('nome'),
        supabase.from('professores').select('id, nome').eq('active', true).order('nome'),
        supabase.from('materias').select('id, nome, cor').eq('active', true).order('nome'),
        supabase.from('tarefas').select('*, turmas(nome), professores(nome), materias(nome, cor)').order('data_aula', { ascending: false }),
      ])
      setTurmas(t || []); setProfessores(profs || []); setMaterias(mats || []); setTarefas(tar || [])
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      if (fTurma && t.turma_id !== fTurma) return false
      if (fProfessor && t.professor_id !== fProfessor) return false
      if (fMateria && t.materia_id !== fMateria) return false
      if (fAno && !t.data_aula.startsWith(fAno)) return false
      if (fMes && !t.data_aula.startsWith(`${fAno}-${fMes.padStart(2,'0')}`)) return false
      return true
    })
  }, [tarefas, fTurma, fProfessor, fMateria, fMes, fAno])

  // Agrupamentos
  const porTurma = useMemo(() => {
    const m: Record<string,number> = {}
    filtered.forEach(t => { m[t.turmas?.nome || 'N/A'] = (m[t.turmas?.nome || 'N/A'] || 0) + 1 })
    return Object.entries(m).sort((a,b) => b[1]-a[1])
  }, [filtered])

  const porProfessor = useMemo(() => {
    const m: Record<string,number> = {}
    filtered.forEach(t => { m[t.professores?.nome || 'N/A'] = (m[t.professores?.nome || 'N/A'] || 0) + 1 })
    return Object.entries(m).sort((a,b) => b[1]-a[1])
  }, [filtered])

  const porMateria = useMemo(() => {
    const m: Record<string,{count:number; cor:string}> = {}
    filtered.forEach(t => {
      const nome = t.materias?.nome || 'N/A'
      if (!m[nome]) m[nome] = { count: 0, cor: t.materias?.cor || '#6366F1' }
      m[nome].count++
    })
    return Object.entries(m).sort((a,b) => b[1].count-a[1].count)
  }, [filtered])

  const porTipo = useMemo(() => {
    const m: Record<string,number> = {}
    filtered.forEach(t => { m[t.tipo_tarefa] = (m[t.tipo_tarefa] || 0) + 1 })
    return Object.entries(m).sort((a,b) => b[1]-a[1])
  }, [filtered])

  function exportCSV() {
    const headers = ['Data Aula','Turma','Professor','Matéria','Título','Tipo','Prioridade','Prazo']
    const rows = filtered.map(t => [
      t.data_aula, t.turmas?.nome, t.professores?.nome, t.materias?.nome,
      t.titulo, t.tipo_tarefa, t.prioridade, t.prazo_entrega || ''
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `tarefas-${fAno}${fMes ? '-'+fMes : ''}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function maxVal(arr: [string,number][]) { return Math.max(...arr.map(a=>a[1]), 1) }

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Relatórios" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} registros no período</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-all hover:scale-[1.02]">
          <Download className="w-5 h-5"/> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-indigo-600"/>
          <h3 className="font-semibold text-slate-900 text-sm">Filtros do Relatório</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select value={fAno} onChange={e => setFAno(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={fMes} onChange={e => setFMes(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Todos os meses</option>
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m,i) =>
              <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>)}
          </select>
          <select value={fTurma} onChange={e => setFTurma(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Todas as turmas</option>
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
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
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Tarefas', value: filtered.length, icon: FileText, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
          { label: 'Turmas Envolvidas', value: porTurma.length, icon: School, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Professores', value: porProfessor.length, icon: Users, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
          { label: 'Matérias', value: porMateria.length, icon: BookOpen, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${c.color} ${c.shadow}`}>
              <c.icon className="w-6 h-6 text-white"/>
            </div>
            <div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Turma */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <School className="w-5 h-5 text-indigo-600"/>
            <h3 className="font-semibold text-slate-900">Tarefas por Turma</h3>
          </div>
          <div className="space-y-3">
            {porTurma.length === 0 ? <p className="text-sm text-slate-400">Sem dados</p> : porTurma.map(([nome, count]) => (
              <div key={nome}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium">{nome}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(count / maxVal(porTurma)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Professor */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-emerald-600"/>
            <h3 className="font-semibold text-slate-900">Tarefas por Professor</h3>
          </div>
          <div className="space-y-3">
            {porProfessor.length === 0 ? <p className="text-sm text-slate-400">Sem dados</p> : porProfessor.map(([nome, count]) => (
              <div key={nome}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium">{nome}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                    style={{ width: `${(count / maxVal(porProfessor)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Matéria */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-amber-600"/>
            <h3 className="font-semibold text-slate-900">Tarefas por Matéria</h3>
          </div>
          <div className="space-y-3">
            {porMateria.length === 0 ? <p className="text-sm text-slate-400">Sem dados</p> : porMateria.map(([nome, { count, cor }]) => (
              <div key={nome}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cor }}/>
                    <span className="text-sm text-slate-700 font-medium">{nome}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(count / Math.max(...porMateria.map(([,v])=>v.count))) * 100}%`, backgroundColor: cor }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Tipo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-rose-600"/>
            <h3 className="font-semibold text-slate-900">Tarefas por Tipo</h3>
          </div>
          <div className="space-y-3">
            {porTipo.length === 0 ? <p className="text-sm text-slate-400">Sem dados</p> : porTipo.map(([tipo, count]) => (
              <div key={tipo}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium">{tipo}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${(count / maxVal(porTipo)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <TrendingUp className="w-5 h-5 text-indigo-600"/>
          <h3 className="font-semibold text-slate-900">Detalhamento</h3>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Turma</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Matéria</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice(0, 50).map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(t.data_aula)}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{t.turmas?.nome}</td>
                  <td className="px-4 py-3">
                    {t.materias && <MateriaBadge nome={t.materias.nome} cor={t.materias.cor}/>}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium max-w-xs truncate">{t.titulo}</td>
                  <td className="px-4 py-3 text-slate-600">{t.tipo_tarefa}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.prazo_entrega ? formatDate(t.prazo_entrega) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 50 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
              Mostrando 50 de {filtered.length} registros. Exporte em CSV para ver todos.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
