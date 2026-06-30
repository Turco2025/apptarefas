'use client'

import { useState, useMemo } from 'react'
import { formatDate, diasParaVencer, TIPO_ICONS } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import {
  Search, Filter, X, Download, ChevronDown, Loader2,
  AlertCircle, Clock, Calendar, Zap, BookOpen, Grid3X3, List,
  LayoutGrid
} from 'lucide-react'
import type { Profile } from '@/types'

const PRIORITY_LABEL_COLOR: Record<string, string> = {
  Baixa:   'bg-slate-100 text-slate-600',
  Normal:  'bg-blue-100 text-blue-700',
  Alta:    'bg-orange-100 text-orange-700',
  Urgente: 'bg-red-100 text-red-700',
}

const TIPOS_ALL = ['Tarefa','Prova','Trabalho','Projeto','Apresentação','Exercício','Seminário','Outro']

interface Props {
  profile: any
  initialTarefas: any[]
  turmas: any[]
  professores: any[]
  materias: any[]
}

function FichaCard({ tarefa, onExport, exportingId }: { tarefa: any; onExport: (t: any) => void; exportingId: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const cor = tarefa.materias?.cor || '#6366f1'
  const dias = diasParaVencer(tarefa.prazo_entrega)
  const urgente = dias !== null && dias <= 3
  const icon = TIPO_ICONS[tarefa.tipo_tarefa] || '📌'
  const patternId = `dash-dots-${tarefa.id}`
  const isExporting = exportingId === tarefa.id

  return (
    <div className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
      urgente ? 'shadow-lg shadow-red-100 ring-1 ring-red-200' : 'shadow-md shadow-slate-100 hover:shadow-xl hover:shadow-slate-200'
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
            {tarefa.turmas && (
              <p className="text-white/70 text-xs mt-1 font-medium">
                {tarefa.turmas.nome} — {tarefa.turmas.serie}
              </p>
            )}
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
                   dias !== null && dias < 0 ? 'Expirado' :
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
                disabled={isExporting}
                className="p-1.5 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> : <Download className="w-3.5 h-3.5" />}
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

export default function FichasClient({ profile, initialTarefas, turmas, professores, materias }: Props) {
  const [busca, setBusca] = useState('')
  const [fTurma, setFTurma] = useState('')
  const [fProfessor, setFProfessor] = useState('')
  const [fMateria, setFMateria] = useState('')
  const [fTipo, setFTipo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [exportingId, setExportingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return initialTarefas.filter(t => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!t.titulo?.toLowerCase().includes(q) &&
            !t.professores?.nome?.toLowerCase().includes(q) &&
            !t.materias?.nome?.toLowerCase().includes(q) &&
            !t.turmas?.nome?.toLowerCase().includes(q)) return false
      }
      if (fTurma && t.turma_id !== fTurma) return false
      if (fProfessor && t.professor_id !== fProfessor) return false
      if (fMateria && t.materia_id !== fMateria) return false
      if (fTipo && t.tipo_tarefa !== fTipo) return false
      return true
    })
  }, [initialTarefas, busca, fTurma, fProfessor, fMateria, fTipo])

  const urgentesCount = useMemo(() =>
    filtered.filter(t => { const d = diasParaVencer(t.prazo_entrega); return d !== null && d >= 0 && d <= 3 }).length,
    [filtered]
  )

  const hasFilters = busca || fTurma || fProfessor || fMateria || fTipo

  async function handleExport(tarefa: any) {
    setExportingId(tarefa.id)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')
      const cor = tarefa.materias?.cor || '#6366f1'
      const dias = diasParaVencer(tarefa.prazo_entrega)

      const div = document.createElement('div')
      div.style.cssText = [
        'position:fixed','left:-9999px','top:-9999px',
        'width:600px','background:white','border-radius:24px',
        'font-family:system-ui,-apple-system,sans-serif',
        'overflow:hidden','box-shadow:0 4px 24px rgba(0,0,0,0.12)',
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
          ${tarefa.turmas ? `<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:8px 0 0;position:relative;z-index:1">${tarefa.turmas.nome} — ${tarefa.turmas.serie}</p>` : ''}
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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <TopBar profile={profile as Profile} title="Fichas Desenhadas" />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-indigo-500" />
            Fichas Desenhadas
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualize as tarefas em formato de fichas coloridas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentesCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              {urgentesCount} urgente{urgentesCount > 1 ? 's' : ''}
            </div>
          )}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grade"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ficha por título, professor, matéria ou turma..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
          </button>
          {hasFilters && (
            <button
              onClick={() => { setBusca(''); setFTurma(''); setFProfessor(''); setFMateria(''); setFTipo('') }}
              className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 animate-fade-in">
            {profile.role !== 'representative' && (
              <select value={fTurma} onChange={e => setFTurma(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Todas as turmas</option>
                {turmas.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            )}
            <select value={fProfessor} onChange={e => setFProfessor(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos os professores</option>
              {professores.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select value={fMateria} onChange={e => setFMateria(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas as matérias</option>
              {materias.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <select value={fTipo} onChange={e => setFTipo(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos os tipos</option>
              {TIPOS_ALL.map(t => <option key={t} value={t}>{t}</option>)}
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
            Tente ajustar os filtros ou acesse Tarefas para criar novas fichas.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t: any) => (
            <FichaCard key={t.id} tarefa={t} onExport={handleExport} exportingId={exportingId} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t: any) => {
            const cor = t.materias?.cor || '#6366f1'
            const dias = diasParaVencer(t.prazo_entrega)
            const urgente = dias !== null && dias <= 3
            const icon = TIPO_ICONS[t.tipo_tarefa] || '📌'
            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${
                  urgente ? 'ring-1 ring-red-200 shadow-sm' : 'border border-slate-100 shadow-sm'
                }`}
              >
                {urgente && <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />}
                <div className="p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${cor}25 0%, ${cor}10 100%)`, border: `1px solid ${cor}25` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: cor + '15', color: cor }}>
                        {t.materias?.nome}
                      </span>
                      {t.turmas && <span className="text-xs text-slate-400">{t.turmas.nome}</span>}
                      <span className="text-xs text-slate-400">{t.tipo_tarefa}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{t.titulo}</h3>
                    {t.professores && <p className="text-xs text-slate-400">{t.professores.nome}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(t.data_aula)}
                    </div>
                    {t.prazo_entrega && (
                      <div className={`flex items-center gap-1 font-semibold ${dias === 0 ? 'text-red-600' : urgente ? 'text-orange-500' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        {dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : formatDate(t.prazo_entrega)}
                      </div>
                    )}
                    <button
                      onClick={() => handleExport(t)}
                      disabled={exportingId === t.id}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-50"
                    >
                      {exportingId === t.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        : <Download className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
