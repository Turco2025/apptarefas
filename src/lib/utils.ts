import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export const PRIORITY_COLORS: Record<string, string> = {
  Baixa:   'bg-slate-100 text-slate-600 border-slate-200',
  Normal:  'bg-blue-100 text-blue-700 border-blue-200',
  Alta:    'bg-orange-100 text-orange-700 border-orange-200',
  Urgente: 'bg-red-100 text-red-700 border-red-200',
}

export const PRIORITY_DOT: Record<string, string> = {
  Baixa:   'bg-slate-400',
  Normal:  'bg-blue-500',
  Alta:    'bg-orange-500',
  Urgente: 'bg-red-500',
}

export const TIPO_ICONS: Record<string, string> = {
  Tarefa:        '📝',
  Prova:         '📋',
  Trabalho:      '📁',
  Projeto:       '🚀',
  Apresentação:  '🎤',
  Exercício:     '✏️',
  Seminário:     '🎓',
  Outro:         '📌',
}

export function diasParaVencer(prazo: string | null): number | null {
  if (!prazo) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(prazo + 'T00:00:00')
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}
