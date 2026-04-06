'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { UserCog, Mail, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CoordenadoresPage() {
  const [profile, setProfile] = useState<any>(null)
  const [coordenadores, setCoordenadores] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: coords } = await supabase
        .from('profiles').select('*').eq('role', 'coordinator').order('name')
      setCoordenadores(coords || [])
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Coordenadores" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Coordenadores</h2>
          <p className="text-slate-500 text-sm mt-0.5">{coordenadores.length} coordenadores</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-medium text-indigo-900">Como criar coordenadores?</p>
          <p className="text-xs text-indigo-700 mt-1">
            Acesse o painel do Supabase → Authentication → Users → Invite User.
            Após o cadastro, altere o campo <code className="bg-indigo-100 px-1 rounded">role</code> na tabela <code className="bg-indigo-100 px-1 rounded">profiles</code> para <strong>coordinator</strong>.
          </p>
        </div>
      </div>

      {coordenadores.length === 0 ? (
        <EmptyState icon={UserCog} title="Nenhum coordenador cadastrado"
          description="Crie coordenadores pelo painel do Supabase conforme instruções acima." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coordenadores.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {c.name.charAt(0)}
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1', c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {c.active ? <><CheckCircle className="w-3 h-3"/>Ativo</> : <><XCircle className="w-3 h-3"/>Inativo</>}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{c.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Mail className="w-3.5 h-3.5"/>{c.email}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">Coordenador</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
