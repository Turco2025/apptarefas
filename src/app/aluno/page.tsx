'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, diasParaVencer, TIPO_ICONS } from '@/lib/utils'
import {
  GraduationCap, Search, LogOut, BookOpen, Clock,
  Calendar, AlertCircle, ChevronDown, X, Download,
  Filter, Grid3X3, List, Loader2, Zap
} from 'lucide-react'

const PRIORITY_LABEL_COLOR: Record<string, string> = {
  Baixa:   'bg-slate-100 text-slate-600',
  Normal:  'bg-blue-100 text-blue-700',
  Alta:    'bg-orange-100 text-orange-700',
  Urgente: 'bg-red-100 text-red-700',
}

function hexToRgb(hex: string) {
  try {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  } catch { return '99, 102, 241' }
}

function FichaCard({ tarefa, onExport }: { tarefa: any; onExport: (t: any) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cor = tarefa.materias?.cor || '#6366f1'
  const dias = diasParaVencer(tarefa.prazo_entrega)
  const urgente = dias !== null && dias <= 3
  const icon = TIPO_ICONS[tarefa.tipo_tarefa] || '📌'
  const patternId = `dots-${tarefa.id}`

  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
      urgente
        ? 'shadow-lg shadow-red-100 ring-1 ring-red-200'
        : 'shadow-md shadow-slate-100 hover:shadow-xl hover:shadow-slate-200'
    }`}>
      {/* Cabeçalho colorido */}
      <div
        className="relative px-5 pt-5 pb-10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cor}ee 0%, ${cor}bb 100%)` }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-semibold">
                <span>{icon}</span>
                {tarefa.tipo_tarefa}
              </span>
              {urgente && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                  <Zap className="w-3 h-3" />
                  URGENTE
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-base leading-snug line-clamp-2 drop-shadow-sm">
              {tarefa.titulo}
            </h3>
          </div>
          <div
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0"
            title={tarefa.tipo_tarefa}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* Corpo em arco */}
      <div className="relative -mt-5 rounded-t-3xl bg-white pt-3">
        <div className="absolute -top-3 left-5 z-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border"
            style={{ backgroundColor: cor + '15', color: cor, borderColor: cor + '30' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
            {tarefa.materias?.nome || 'Matéria'}
          </span>
        </div>

        <div className="px-5 pt-5 pb-5 space-y-3">
          {tarefa.professores && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}99 100%)` }}
              >
                {tarefa.professores.nome.charAt(0)}
              </div>
              <span className="truncate">{tarefa.professores.nome}</span>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Aula: <strong className="text-slate-700">{formatDate(tarefa.data_aula)}</strong></span>
            </div>
            {tarefa.prazo_entrega && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                dias === 0 ? 'text-red-600' : urgente ? 'text-orange-600' : 'text-slate-500'
              }`}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {dias === 0 ? 'Entrega HOJE!' :
                   dias === 1 ? 'Entrega amanhã' :
                   dias !== null && dias < 0 ? 'Prazo expirado' :
                   `Prazo: ${formatDate(tarefa.prazo_entrega)}`}
                </span>
                {urgente && dias !== null && dias >= 0 && <AlertCircle className="w-3 h-3" />}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_LABEL_COLOR[tarefa.prioridade] || PRIORITY_LABEL_COLOR.Normal}`}>
              {tarefa.prioridade}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onExport(tarefa)}
                title="Baixar ficha em PDF"
                className="p-1.5 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {(tarefa.descricao || tarefa.observacoes) && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors"
                  style={{ color: cor }}
                >
                  {expanded ? 'Fechar' : 'Ver mais'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {expanded && (tarefa.descricao || tarefa.observacoes) && (
            <div className="border-t border-slate-100 pt-3 space-y-2 animate-fade-in">
              {tarefa.descricao && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Descrição</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{tarefa.descricao}</p>
                </div>
              )}
              {tarefa.observacoes && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{tarefa.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FichaListItem({ tarefa, onExport }: { tarefa: any; onExport: (t: any) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cor = tarefa.materias?.cor || '#6366f1'
  const dias = diasParaVencer(tarefa.prazo_entrega)
  const urgente = dias !== null && dias <= 3
  const icon = TIPO_ICONS[tarefa.tipo_tarefa] || '📌'

  return (
    <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${
      urgente ? 'ring-1 ring-red-200 shadow-sm' : 'border border-slate-100 shadow-sm'
    }`}>
      {urgente && <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${cor}25 0%, ${cor}10 100%)`, border: `1px solid ${cor}25` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cor + '15', color: cor }}
              >
                {tarefa.materias?.nome}
              </span>
              <span className="text-xs text-slate-400">{tarefa.tipo_tarefa}</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{tarefa.titulo}</h3>
            {tarefa.professores && (
              <p className="text-xs text-slate-400 mt-0.5">{tarefa.professores.nome}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {formatDate(tarefa.data_aula)}
            </div>
            {tarefa.prazo_entrega && (
              <div className={`flex items-center gap-1 font-semibold ${
                dias === 0 ? 'text-red-600' : urgente ? 'text-orange-500' : 'text-slate-400'
              }`}>
                <Clock className="w-3 h-3" />
                {dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : formatDate(tarefa.prazo_entrega)}
              </div>
            )}
            <div className="flex gap-1">
              {(tarefa.descricao || tarefa.observacoes) && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button
                onClick={() => onExport(tarefa)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        {expanded && (tarefa.descricao || tarefa.observacoes) && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
            {tarefa.descricao && <p className="text-sm text-slate-600 leading-relaxed">{tarefa.descricao}</p>}
            {tarefa.observacoes && <p className="text-sm text-slate-500 leading-relaxed italic">{tarefa.observacoes}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AlunoPage() {
  const router = useRouter()
  const [turma, setTurma] = useState<any>(null)
  const [tarefas, setTarefas] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [materias, setMaterias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [fProfessor, setFProfessor] = useState('')
  const [fMateria, setFMateria] = useState('')
  const [fTipo, setFTipo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    const t = sessionStorage.getItem('aluno_turma')
    if (!t) { router.push('/acesso-aluno'); return }
    const turmaData = JSON.parse(t)
    setTurma(turmaData)

    async function load() {
      const supabase = createClient()
      const { data: tars } = await supabase
        .from('tarefas')
        .select('*, professores(nome), materias(nome, cor)')
        .eq('turma_id', turmaData.id)
        .order('data_aula', { ascending: true })
      const { data: profs } = await supabase
        .from('professores').select('id, nome').eq('active', true).order('nome')
      const { data: mats } = await supabase
        .from('materias').select('id, nome, cor').eq('active', true).order('nome')
      setTarefas(tars || [])
      setProfessores(profs || [])
      setMaterias(mats || [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!t.titulo?.toLowerCase().includes(q) &&
            !t.professores?.nome?.toLowerCase().includes(q) &&
            !t.materias?.nome?.toLowerCase().includes(q)) return false
      }
      if (fProfessor && t.professor_id !== fProfessor) return false
      if (fMateria && t.materia_id !== fMateria) return false
      if (fTipo && t.tipo_tarefa !== fTipo) return false
      return true
    })
  }, [tarefas, busca, fProfessor, fMateria, fTipo])

  const TIPOS = useMemo(() => [...new Set(tarefas.map(t => t.tipo_tarefa))], [tarefas])

  const urgentes = useMemo(() => filtered.filter(t => {
    const d = diasParaVencer(t.prazo_entrega)
    return d !== null && d >= 0 && d <= 3
  }), [filtered])

  const hasFilters = busca || fProfessor || fMateria || fTipo

  async function handleExport(tarefa: any) {
    setExportingId(tarefa.id)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')
      const cor = tarefa.materias?.cor || '#6366f1'
      const dias = diasParaVencer(tarefa.prazo_entrega)

      const div = document.createElement('div')
      div.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:-9999px',
        'width:600px', 'background:white', 'border-radius:24px',
        'font-family:system-ui,-apple-system,sans-serif',
        'overflow:hidden', 'box-shadow:0 4px 24px rgba(0,0,0,0.12)',
      ].join(';')

      div.innerHTML = `
        <div style="background:linear-gradient(135deg,${cor}ee,${cor}bb);padding:32px 28px 52px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.1)"></div>
          <div style="position:absolute;bottom:-20px;left:-20px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.1)"></div>
          <div style="position:relative;z-index:1;margin-bottom:14px">
            <span style="background:rgba(255,255,255,0.25);color:white;padding:6px 14px;border-radius:99px;font-size:13px;font-weight:700">
              ${TIPO_ICONS[tarefa.tipo_tarefa] || '📌'} ${tarefa.tipo_tarefa}
            </span>
          </div>
          <h1 style="color:white;font-size:22px;font-weight:800;margin:0;position:relative;z-index:1;line-height:1.3">${tarefa.titulo}</h1>
        </div>
        <div style="background:white;border-radius:24px 24px 0 0;margin-top:-20px;padding:28px 28px 32px;position:relative">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;border:1px solid ${cor}30;background:${cor}10;color:${cor};font-size:12px;font-weight:700;margin-bottom:20px">
            <span style="width:8px;height:8px;border-radius:50%;background:${cor};display:inline-block"></span>
            ${tarefa.materias?.nome || ''}
          </div>
          ${tarefa.professores ? `<div style="font-size:14px;color:#64748b;margin-bottom:16px">Prof.: <strong style="color:#334155">${tarefa.professores.nome}</strong></div>` : ''}
          <div style="display:flex;gap:24px;margin-bottom:${tarefa.descricao ? '20px' : '8px'}">
            <div style="font-size:13px;color:#64748b">📅 Aula: <strong>${formatDate(tarefa.data_aula)}</strong></div>
            ${tarefa.prazo_entrega ? `<div style="font-size:13px;color:${dias !== null && dias <= 3 ? '#ef4444' : '#64748b'}">⏰ Prazo: <strong>${formatDate(tarefa.prazo_entrega)}</strong></div>` : ''}
          </div>
          ${tarefa.descricao ? `<div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:12px"><p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px">Descrição</p><p style="font-size:14px;color:#475569;margin:0;line-height:1.6">${tarefa.descricao}</p></div>` : ''}
          ${tarefa.observacoes ? `<div style="background:#fafafa;border-radius:12px;padding:16px"><p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px">Observações</p><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;font-style:italic">${tarefa.observacoes}</p></div>` : ''}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:11px;color:#cbd5e1">AppTarefas — Fichas Desenhadas</span>
            <span style="background:${cor}15;color:${cor};font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px">${tarefa.prioridade}</span>
          </div>
        </div>
      `
      document.body.appendChild(div)
      const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: 'white' })
      document.body.removeChild(div)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const ratio = canvas.height / canvas.width
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, (pdfWidth - 20) * ratio)
      pdf.save(`ficha-${tarefa.titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } catch (e) {
      console.error('Erro ao exportar:', e)
    }
    setExportingId(null)
  }

  function sair() {
    sessionStorage.removeItem('aluno_turma')
    router.push('/acesso-aluno')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-500 font-medium">Carregando fichas...</p>
      </div>
    </div>
  )

  if (!turma) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 50%, #faf5ff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium">Fichas Desenhadas</p>
              <h1 className="font-bold text-slate-900 text-sm leading-tight truncate">{turma.nome}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold border border-indigo-100">
              {turma.serie} · {turma.turno}
            </span>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={sair}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Banner urgentes */}
        {urgentes.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white animate-fade-in">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs><pattern id="urgentes-bg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="white" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#urgentes-bg)" />
              </svg>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">
                  {urgentes.length} tarefa{urgentes.length > 1 ? 's' : ''} com prazo próximo!
                </p>
                <p className="text-xs text-red-100 truncate">
                  {urgentes.map((t: any) => t.titulo).join(' · ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Busca e filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar ficha, professor ou matéria..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || hasFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:block">Filtrar</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setBusca(''); setFProfessor(''); setFMateria(''); setFTipo('') }}
                className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 animate-fade-in">
              <select value={fProfessor} onChange={e => setFProfessor(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos os professores</option>
                {professores.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <select value={fMateria} onChange={e => setFMateria(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas as matérias</option>
                {materias.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <select value={fTipo} onChange={e => setFTipo(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todos os tipos</option>
                {TIPOS.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between text-sm text-slate-500 px-1">
          <span>
            <strong className="text-slate-900">{filtered.length}</strong> ficha{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </span>
          {exportingId && (
            <span className="flex items-center gap-1.5 text-indigo-600 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Gerando PDF...
            </span>
          )}
        </div>

        {/* Fichas */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4">
              <BookOpen className="w-9 h-9 text-indigo-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Nenhuma ficha encontrada</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Tente ajustar os filtros ou aguarde novas fichas do representante.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t: any) => (
              <FichaCard key={t.id} tarefa={t} onExport={handleExport} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: any) => (
              <FichaListItem key={t.id} tarefa={t} onExport={handleExport} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
