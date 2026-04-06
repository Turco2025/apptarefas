import { cn } from '@/lib/utils'
import { PRIORITY_COLORS, TIPO_ICONS } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function Badge({ children, className, color }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      className
    )}
    style={color ? { backgroundColor: color + '20', color, borderColor: color + '40' } : undefined}
    >
      {children}
    </span>
  )
}

export function PriorityBadge({ prioridade }: { prioridade: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      PRIORITY_COLORS[prioridade] || PRIORITY_COLORS.Normal
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {prioridade}
    </span>
  )
}

export function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <span>{TIPO_ICONS[tipo] || '📌'}</span>
      {tipo}
    </span>
  )
}

export function MateriaBadge({ nome, cor }: { nome: string; cor: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: cor + '18', color: cor, borderColor: cor + '35' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cor }} />
      {nome}
    </span>
  )
}
