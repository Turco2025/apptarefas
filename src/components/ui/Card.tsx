import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-sm',
        hover && 'cursor-pointer hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'orange'
  subtitle?: string
}

const colorMap = {
  indigo:  { bg: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-600',  shadow: 'shadow-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-500/20' },
  amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   shadow: 'shadow-amber-500/20' },
  rose:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600',    shadow: 'shadow-rose-500/20' },
  cyan:    { bg: 'bg-cyan-500',    light: 'bg-cyan-50',    text: 'text-cyan-600',    shadow: 'shadow-cyan-500/20' },
  purple:  { bg: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600',  shadow: 'shadow-purple-500/20' },
  orange:  { bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  shadow: 'shadow-orange-500/20' },
}

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4',
      'shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
    )}>
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0', c.bg, c.shadow)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
