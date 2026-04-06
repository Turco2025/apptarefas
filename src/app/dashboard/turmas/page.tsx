'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Search, Edit2, Trash2, X, Loader2, School, Hash, Clock, CheckCircle, XCircle, Copy, AlertCircle } from 'lucide-react'
import type { Profile, Turma } from '@/types'
import { cn } from '@/lib/utils'

const TURNOS = ['Matutino','Vespertino','Noturno','Integral']
const TURNO_COLORS: Record<string,string> = {
  Matutino: 'bg-amber-50 text-amber-700',
  Vespertino: 'bg-orange-50 text-orange-700',
  Noturno: 'bg-indigo-50 text-indigo-700',
  Integral: 'bg-emerald-50 text-emerald-700',
}

export default function TurmasPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Turma | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string|null>(null)
  const [form, setForm] = useState({ nome: '', serie: '', turno: 'Matutino', access_code: '', active: true })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: t } = await supabase.from('turmas').select('*, profiles(name)').order('nome')
      setTurmas(t || [])
    }
    load()
  }, [])

  const filtered = turmas.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.serie.toLowerCase().includes(busca.toLowerCase())
  )

  function generateCode(nome: string) {
    const suffix = Math.floor(Math.random() * 9000 + 1000) // 1000–9999
    return nome.toUpperCase().replace(/\s+/g, '').substring(0, 8) + suffix
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      const { data } = await supabase.from('turmas').update(form).eq('id', editing.id).select('*, profiles(name)').single()
      if (data) setTurmas(prev => prev.map(t => t.id === data.id ? data : t))
    } else {
      const { data } = await supabase.from('turmas').insert(form).select('*, profiles(name)').single()
      if (data) setTurmas(prev => [...prev, data])
    }
    setSaving(false)
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta turma?')) return
    setDeletingId(id)
    setDeleteError(null)
    const supabase = createClient()
    const { error } = await supabase.from('turmas').delete().eq('id', id)
    if (error) {
      setDeleteError('Erro ao excluir turma. Tente novamente.')
      setDeletingId(null)
      return
    }
    setTurmas(prev => prev.filter(t => t.id !== id))
    setDeletingId(null)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Turmas" />

      {deleteError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Turmas</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} turmas</p>
        </div>
        {profile.role === 'admin' && (
          <button onClick={() => { setForm({ nome: '', serie: '', turno: 'Matutino', access_code: '', active: true }); setEditing(null); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all">
            <Plus className="w-5 h-5" /> Nova Turma
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar turma..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={School} title="Nenhuma turma encontrada" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{t.nome}</h3>
                  <p className="text-sm text-slate-500">{t.serie}</p>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', TURNO_COLORS[t.turno])}>
                  <Clock className="w-3 h-3 inline mr-1"/>{t.turno}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Hash className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                <span className="font-mono text-sm font-semibold text-slate-700 flex-1">{t.access_code}</span>
                <button onClick={() => copyCode(t.access_code)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  {copied === t.access_code ? <CheckCircle className="w-4 h-4 text-emerald-600"/> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
              {t.profiles && (
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-bold">R</span>
                  {t.profiles.name}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', t.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {t.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              {profile.role === 'admin' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => { setForm({ nome: t.nome, serie: t.serie, turno: t.turno, access_code: t.access_code, active: t.active }); setEditing(t); setShowModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium transition-colors">
                    <Edit2 className="w-3.5 h-3.5"/>Editar
                  </button>
                  <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors disabled:opacity-50">
                    {deletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Editar Turma' : 'Nova Turma'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Turma *</label>
                <input required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  placeholder="Ex: 9º Ano A"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Série/Ano *</label>
                <input required type="text" value={form.serie} onChange={e => setForm({...form, serie: e.target.value})}
                  placeholder="Ex: 9º Ano"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Turno *</label>
                <select required value={form.turno} onChange={e => setForm({...form, turno: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Código de Acesso *</label>
                <div className="flex gap-2">
                  <input required type="text" value={form.access_code} onChange={e => setForm({...form, access_code: e.target.value.toUpperCase()})}
                    placeholder="Ex: TURMA9A"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
                  <button type="button" onClick={() => setForm({...form, access_code: generateCode(form.nome || 'TURMA')})}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors whitespace-nowrap">
                    Gerar
                  </button>
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
