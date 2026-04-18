'use client'

import { useState, useRef } from 'react'
import { ImageIcon, ChevronRight, RotateCcw, Download, Sparkles, BookOpen, Layers, FileText, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import InfographicRenderer from './InfographicRenderer'

interface AgentData {
  materia: string
  topico: string
  subtopico: string
  conteudo: string
}

const STEPS = [
  {
    id: 'materia',
    icon: BookOpen,
    color: 'blue',
    question: 'Qual é a matéria?',
    hint: 'Ex: Física, Química, Biologia, Matemática, História...',
    placeholder: 'Digite a matéria...',
  },
  {
    id: 'topico',
    icon: Layers,
    color: 'orange',
    question: 'Qual é o tópico?',
    hint: 'Ex: Hidrostática, Termoquímica, Genética, Geometria Plana...',
    placeholder: 'Digite o tópico...',
  },
  {
    id: 'subtopico',
    icon: FileText,
    color: 'red',
    question: 'Qual é o subtópico?',
    hint: 'Ex: Empuxo, Entalpia de Formação, Lei de Mendel, Teorema de Pitágoras...',
    placeholder: 'Digite o subtópico...',
  },
  {
    id: 'conteudo',
    icon: AlignLeft,
    color: 'green',
    question: 'Qual é o conteúdo ou problema?',
    hint: 'Cole um exercício do ENEM/vestibular ou descreva o conteúdo a ser abordado no infográfico.',
    placeholder: 'Descreva o conteúdo ou cole um problema...',
    multiline: true,
  },
] as const

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; icon: string; progress: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700',  icon: 'text-blue-500',  progress: 'bg-blue-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', progress: 'bg-orange-500' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   icon: 'text-red-500',   progress: 'bg-red-500' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500', progress: 'bg-green-500' },
}

export default function InfographicAgent({ profile }: { profile: Profile }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<AgentData>>({})
  const [currentValue, setCurrentValue] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<AgentData | null>(null)
  const infographicRef = useRef<HTMLDivElement>(null)

  const currentStep = STEPS[step]
  const colors = currentStep ? COLOR_CLASSES[currentStep.color] : COLOR_CLASSES.blue
  const progress = ((step) / STEPS.length) * 100

  function handleNext() {
    if (!currentValue.trim()) return
    const newData = { ...data, [currentStep.id]: currentValue.trim() }
    setData(newData)
    setCurrentValue('')

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setGenerating(true)
      setTimeout(() => {
        setGenerated(newData as AgentData)
        setGenerating(false)
      }, 1800)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && currentStep.id !== 'conteudo') {
      e.preventDefault()
      handleNext()
    }
    if (e.key === 'Enter' && e.ctrlKey && currentStep.id === 'conteudo') {
      e.preventDefault()
      handleNext()
    }
  }

  function handleReset() {
    setStep(0)
    setData({})
    setCurrentValue('')
    setGenerated(null)
    setGenerating(false)
  }

  async function handleDownload() {
    if (!infographicRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(infographicRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)
    pdf.save(`infografico-${generated?.subtopico?.replace(/\s+/g, '-').toLowerCase() || 'educacional'}.pdf`)
  }

  if (generated) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-indigo-600" />
              Infográfico Gerado
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {generated.materia} · {generated.topico} · {generated.subtopico}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Novo
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium shadow-md shadow-indigo-500/20"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div ref={infographicRef} className="w-full max-w-[794px]">
            <InfographicRenderer data={generated} />
          </div>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Gerando Infográfico...</h2>
          <p className="text-slate-500 mt-1 text-sm">Montando o layout educacional em A4</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 min-h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-indigo-600" />
          Agente de Infográfico
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Responda as perguntas abaixo para gerar um infográfico educacional em A4.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">
            Passo {step + 1} de {STEPS.length}
          </span>
          <span className="text-xs font-medium text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step indicators */}
        <div className="flex gap-2 mt-3">
          {STEPS.map((s, i) => {
            const c = COLOR_CLASSES[s.color]
            const done = i < step
            const active = i === step
            const Icon = s.icon
            return (
              <div
                key={s.id}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all',
                  active ? cn(c.bg, c.border) : done ? 'bg-slate-50 border-slate-200' : 'border-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? c.icon : done ? 'text-slate-400' : 'text-slate-300')} />
                <span className={cn('text-[10px] font-medium hidden sm:block', active ? c.text : done ? 'text-slate-400' : 'text-slate-300')}>
                  {s.id.charAt(0).toUpperCase() + s.id.slice(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Previous answers */}
      {step > 0 && (
        <div className="mb-6 space-y-2">
          {STEPS.slice(0, step).map((s) => {
            const c = COLOR_CLASSES[s.color]
            const val = data[s.id as keyof AgentData]
            const Icon = s.icon
            return (
              <div key={s.id} className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border', c.bg, c.border)}>
                <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', c.icon)} />
                <div>
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', c.text)}>{s.id}</span>
                  <p className="text-slate-700 text-sm mt-0.5 line-clamp-2">{val}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Current question card */}
      <div className={cn('flex-1 flex flex-col gap-6 p-6 rounded-2xl border-2 transition-all', colors.bg, colors.border)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
            <currentStep.icon className={cn('w-5 h-5', colors.icon)} />
          </div>
          <div>
            <h2 className={cn('text-lg font-bold', colors.text)}>{currentStep.question}</h2>
            <p className="text-slate-500 text-sm">{currentStep.hint}</p>
          </div>
        </div>

        {currentStep.id === 'conteudo' ? (
          <textarea
            autoFocus
            value={currentValue}
            onChange={e => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStep.placeholder}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm shadow-sm"
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={currentValue}
            onChange={e => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStep.placeholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
          />
        )}

        <div className="flex items-center justify-between">
          {currentStep.id === 'conteudo' && (
            <p className="text-xs text-slate-400">Pressione Ctrl+Enter para continuar</p>
          )}
          {currentStep.id !== 'conteudo' && (
            <p className="text-xs text-slate-400">Pressione Enter para continuar</p>
          )}
          <button
            onClick={handleNext}
            disabled={!currentValue.trim()}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ml-auto',
              currentValue.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {step < STEPS.length - 1 ? (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            ) : (
              <>Gerar Infográfico <Sparkles className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
