'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Mail, School, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface RepresentanteComTurma extends Profile {
  turmas: { nome: string; serie: string } | null
}

export default function RepresentantesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [representantes, setRepresentantes] = useState<RepresentanteComTurma[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: reps } = await supabase
        .from('profiles')
        .select('*, turmas(nome, serie)')
        .eq('role', 'representative')
        .order('name')
      setRepresentantes(reps || [])
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Representantes" />

      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Representantes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{representantes.length} representantes</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-medium text-emerald-900">Como criar representantes?</p>
          <p className="text-xs text-emerald-700 mt-1">
            Acesse o painel do Supabase → Authentication → Users → Invite User.
            Após o cadastro, defina <code className="bg-emerald-100 px-1 rounded">role</code> = <strong>representative</strong> e vincule a <code className="bg-emerald-100 px-1 rounded">turma_id</code> na tabela <code className="bg-emerald-100 px-1 rounded">profiles</code>.
          </p>
        </div>
      </div>

      {representantes.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum representante cadastrado"
          description="Crie representantes pelo painel do Supabase conforme instruções acima." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {representantes.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {r.name.charAt(0)}
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1', r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {r.active ? <><CheckCircle className="w-3 h-3"/>Ativo</> : <><XCircle className="w-3 h-3"/>Inativo</>}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{r.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Mail className="w-3.5 h-3.5"/>{r.email}
              </div>
              {r.turmas && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <School className="w-3.5 h-3.5"/>
                  <span className="font-medium text-slate-700">{r.turmas.nome}</span>
                  <span>· {r.turmas.serie}</span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Representante</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
