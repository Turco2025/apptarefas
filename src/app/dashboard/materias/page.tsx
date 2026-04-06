'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Search, Edit2, Trash2, X, Loader2, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, Materia } from '@/types'

const CORES = ['#6366F1','#EC4899','#F59E0B','#10B981','#06B6D4','#8B5CF6','#EF4444','#F97316','#84CC16','#F43F5E','#0EA5E9','#14B8A6']

export default function MateriasPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [materias, setMaterias] = useState<Materia[]>([])
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Materia | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', descricao: '', cor: '#6366F1', active: true })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: mats } = await supabase.from('materias').select('*').order('nome')
      setMaterias(mats || [])
    }
    load()
  }, [])

  const filtered = materias.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (m.descricao || '').toLowerCase().includes(busca.toLowerCase())
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      const { data } = await supabase.from('materias').update(form).eq('id', editing.id).select().single()
      if (data) setMaterias(prev => prev.map(m => m.id === data.id ? data : m))
    } else {
      const { data } = await supabase.from('materias').insert(form).select().single()
      if (data) setMaterias(prev => [...prev, data])
    }
    setSaving(false)
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta matéria?')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('materias').delete().eq('id', id)
    setMaterias(prev => prev.filter(m => m.id !== id))
    setDeletingId(null)
  }

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Matérias" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matérias</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} matérias</p>
        </div>
        {profile.role === 'admin' && (
          <button onClick={() => { setForm({ nome: '', descricao: '', cor: '#6366F1', active: true }); setEditing(null); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all">
            <Plus className="w-5 h-5" /> Nova Matéria
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar matéria..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nenhuma matéria encontrada" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-2" style={{ backgroundColor: m.cor }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: m.cor }}>
                    {m.nome.charAt(0)}
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', m.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                    {m.active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{m.nome}</h3>
                {m.descricao && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.descricao}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: m.cor }} />
                  <span className="text-xs text-slate-400 font-mono">{m.cor}</span>
                </div>
                {profile.role === 'admin' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button onClick={() => { setForm({ nome: m.nome, descricao: m.descricao || '', cor: m.cor, active: m.active }); setEditing(m); setShowModal(true) }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium transition-colors">
                      <Edit2 className="w-3.5 h-3.5"/>Editar
                    </button>
                    <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors disabled:opacity-50">
                      {deletingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Editar Matéria' : 'Nova Matéria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome *</label>
                <input required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea rows={2} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cor identificadora</label>
                <div className="flex flex-wrap gap-2">
                  {CORES.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, cor: c})}
                      className={cn('w-8 h-8 rounded-xl transition-all border-2', form.cor === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105')}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: form.cor }} />
                  <span className="text-sm text-slate-600 font-mono">{form.cor}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <button type="button" onClick={() => setForm({...form, active: !form.active})}
                  className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all', form.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {form.active ? <><CheckCircle className="w-4 h-4"/>Ativa</> : <><XCircle className="w-4 h-4"/>Inativa</>}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
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
