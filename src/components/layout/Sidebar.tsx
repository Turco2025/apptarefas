'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap, LayoutDashboard, ClipboardList, Calendar,
  Users, BookOpen, School, UserCog, FileText, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { href: '/dashboard',               label: 'Dashboard',       icon: LayoutDashboard, roles: ['admin','coordinator','representative'] },
  { href: '/dashboard/tarefas',       label: 'Tarefas',         icon: ClipboardList,   roles: ['admin','coordinator','representative'] },
  { href: '/dashboard/calendario',    label: 'Calendário',      icon: Calendar,        roles: ['admin','coordinator','representative'] },
  { href: '/dashboard/professores',   label: 'Professores',     icon: Users,           roles: ['admin','coordinator'] },
  { href: '/dashboard/materias',      label: 'Matérias',        icon: BookOpen,        roles: ['admin','coordinator'] },
  { href: '/dashboard/turmas',        label: 'Turmas',          icon: School,          roles: ['admin','coordinator'] },
  { href: '/dashboard/coordenadores', label: 'Coordenadores',   icon: UserCog,         roles: ['admin'] },
  { href: '/dashboard/representantes',label: 'Representantes',  icon: Users,           roles: ['admin','coordinator'] },
  { href: '/dashboard/relatorios',    label: 'Relatórios',      icon: FileText,        roles: ['admin','coordinator'] },
  { href: '/dashboard/configuracoes', label: 'Configurações',   icon: Settings,        roles: ['admin'] },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  representative: 'Representante',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  coordinator: 'bg-blue-100 text-blue-700',
  representative: 'bg-emerald-100 text-emerald-700',
}

interface SidebarProps {
  profile: Profile
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter(item => item.roles.includes(profile.role))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center px-4 py-5 border-b border-slate-100',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-slate-900 text-base">AppTarefas</span>
            <p className="text-xs text-slate-400">Sistema Escolar</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              )} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Perfil */}
      <div className={cn(
        'p-3 border-t border-slate-100',
        collapsed ? 'items-center' : ''
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile.name}</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[profile.role])}>
                {ROLE_LABELS[profile.role]}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="w-4.5 h-4.5 group-hover:text-red-600 transition-colors" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col h-full bg-white border-r border-slate-100 shadow-sm transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>
    </>
  )
}
