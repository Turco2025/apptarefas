'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Search, Edit2, Trash2, X, Loader2, Users, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, Materia } from '@/types'

interface ProfessorComMaterias {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  active: boolean
  professor_materias: Array<{ materia_id: string; materias: { nome: string; cor: string } | null }>
}

export default function ProfessoresPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [professores, setProfessores] = useState<ProfessorComMaterias[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ProfessorComMaterias | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', active: true, materias: [] as string[] })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: profs } = await supabase
        .from('professores')
        .select('*, professor_materias(materia_id, materias(nome, cor))')
        .order('nome')
      setProfessores(profs || [])
      const { data: mats } = await supabase.from('materias').select('id, nome, cor').eq('active', true).order('nome')
      setMaterias(mats || [])
    }
    load()
  }, [])

  const filtered = professores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  function openNew() {
    setForm({ nome: '', email: '', telefone: '', active: true, materias: [] })
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(p: ProfessorComMaterias) {
    setForm({
      nome: p.nome, email: p.email || '', telefone: p.telefone || '',
      active: p.active,
      materias: p.professor_materias?.map(pm => pm.materia_id) || []
    })
    setEditing(p)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    if (editing) {
      await supabase.from('professores').update({
        nome: form.nome, email: form.email || null,
        telefone: form.telefone || null, active: form.active
      }).eq('id', editing.id)
      await supabase.from('professor_materias').delete().eq('professor_id', editing.id)
      if (form.materias.length > 0) {
        await supabase.from('professor_materias').insert(
          form.materias.map(mid => ({ professor_id: editing.id, materia_id: mid }))
        )
      }
    } else {
      const { data: novo } = await supabase
        .from('professores')
        .insert({ nome: form.nome, email: form.email || null, telefone: form.telefone || null })
        .select().single()
      if (novo && form.materias.length > 0) {
        await supabase.from('professor_materias').insert(
          form.materias.map(mid => ({ professor_id: novo.id, materia_id: mid }))
        )
      }
    }

    // Recarrega
    const { data: profs } = await supabase
      .from('professores')
      .select('*, professor_materias(materia_id, materias(nome, cor))')
      .order('nome')
    setProfessores(profs || [])
    setSaving(false)
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este professor?')) return
    setDeletingId(id)
    setDeleteError(null)
    const supabase = createClient()
    const { error } = await supabase.from('professores').delete().eq('id', id)
    if (error) {
      setDeleteError('Erro ao excluir professor. Tente novamente.')
      setDeletingId(null)
      return
    }
    setProfessores(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
  }

  function toggleMateria(id: string) {
    setForm(prev => ({
      ...prev,
      materias: prev.materias.includes(id)
        ? prev.materias.filter(m => m !== id)
        : [...prev.materias, id]
    }))
  }

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Professores" />

      {deleteError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Professores</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} professores</p>
        </div>
        {profile.role === 'admin' && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all">
            <Plus className="w-5 h-5" /> Novo Professor
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar professor..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum professor encontrado" description="Cadastre professores para começar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
                  {p.nome.charAt(0)}
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {p.active ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Ativo</span> : <span className="flex items-center gap-1"><XCircle className="w-3 h-3"/>Inativo</span>}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{p.nome}</h3>
              {p.email && <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1"><Mail className="w-3.5 h-3.5"/>{p.email}</div>}
              {p.telefone && <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1"><Phone className="w-3.5 h-3.5"/>{p.telefone}</div>}
              {p.professor_materias?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.professor_materias.map(pm => (
                    <span key={pm.materia_id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: pm.materias?.cor + '20', color: pm.materias?.cor, border: `1px solid ${pm.materias?.cor}30` }}>
                      {pm.materias?.nome}
                    </span>
                  ))}
                </div>
              )}
              {profile.role === 'admin' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium transition-colors">
                    <Edit2 className="w-3.5 h-3.5"/>Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors disabled:opacity-50">
                    {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Editar Professor' : 'Novo Professor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo *</label>
                <input required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                <input type="text" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Matérias</label>
                <div className="flex flex-wrap gap-2">
                  {materias.map(m => (
                    <button key={m.id} type="button" onClick={() => toggleMateria(m.id)}
                      className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all', form.materias.includes(m.id) ? 'border-current' : 'border-transparent bg-slate-100 text-slate-500')}
                      style={form.materias.includes(m.id) ? { backgroundColor: m.cor + '20', color: m.cor, borderColor: m.cor + '60' } : {}}>
                      {m.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <button type="button" onClick={() => setForm({...form, active: !form.active})}
                  className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all', form.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {form.active ? <><CheckCircle className="w-4 h-4"/>Ativo</> : <><XCircle className="w-4 h-4"/>Inativo</>}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Salvando...</> : editing ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
