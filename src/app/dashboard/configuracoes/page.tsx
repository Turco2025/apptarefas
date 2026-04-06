'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { Settings, Shield, Bell, Database, Info, CheckCircle } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [profile, setProfile] = useState<any>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    load()
  }, [])

  if (!profile) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile} title="Configurações" />

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie as preferências do sistema</p>
      </div>

      <div className="grid gap-5 max-w-2xl">
        {/* Informações do sistema */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-indigo-600"/>
            </div>
            <h3 className="font-semibold text-slate-900">Informações do Sistema</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Sistema', value: 'AppTarefas v1.0' },
              { label: 'Banco de dados', value: 'Supabase (PostgreSQL)' },
              { label: 'Framework', value: 'Next.js 14' },
              { label: 'Modo', value: 'PWA (Progressive Web App)' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600"/>
            </div>
            <h3 className="font-semibold text-slate-900">Segurança</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Row Level Security (RLS)', status: true },
              { label: 'Autenticação Supabase Auth', status: true },
              { label: 'Senhas criptografadas (bcrypt)', status: true },
              { label: 'Controle de acesso por perfil', status: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5"/>Ativo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Perfil atual */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600"/>
            </div>
            <h3 className="font-semibold text-slate-900">Seu Perfil</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Nome', value: profile.name },
              { label: 'E-mail', value: profile.email },
              { label: 'Perfil', value: profile.role === 'admin' ? 'Administrador' : profile.role === 'coordinator' ? 'Coordenador' : 'Representante' },
              { label: 'Status', value: profile.active ? 'Ativo' : 'Inativo' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
