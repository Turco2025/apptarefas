'use client'

import { Bell } from 'lucide-react'
import type { Profile } from '@/types'

interface TopBarProps {
  profile: Profile
  title?: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  representative: 'Representante',
}

export default function TopBar({ profile, title }: TopBarProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        {title ? (
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        ) : (
          <div>
            <p className="text-sm text-slate-500">{greeting},</p>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">{profile.name}</h1>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          {ROLE_LABELS[profile.role]}
        </span>
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-indigo-500/20">
          {profile.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
