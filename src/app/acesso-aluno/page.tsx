'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Hash, ArrowLeft, Loader2, GraduationCap, BookOpen, Star, Zap } from 'lucide-react'

const MATERIA_EXEMPLOS = [
  { nome: 'Matemática', cor: '#6366f1', icon: '📐' },
  { nome: 'Português',  cor: '#ec4899', icon: '📝' },
  { nome: 'História',   cor: '#f59e0b', icon: '📖' },
  { nome: 'Ciências',   cor: '#10b981', icon: '🔬' },
]

export default function AcessoAlunoPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('turmas')
      .select('id, nome, serie, turno')
      .eq('access_code', code.toUpperCase().trim())
      .eq('active', true)
      .single()

    if (dbError || !data) {
      setError('Código inválido ou turma inativa. Verifique com seu representante.')
      setLoading(false)
      return
    }

    sessionStorage.setItem('aluno_turma', JSON.stringify(data))
    router.push('/aluno')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)' }}>
      {/* Decorações de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/5 blur-2xl" />
        {/* Grid de pontos */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-dots)" />
        </svg>
      </div>

      {/* Painel esquerdo — visual (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative z-10">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 text-yellow-900 fill-yellow-900" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
            Fichas Desenhadas
          </h1>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Acesse as fichas de tarefas da sua turma de forma rápida e visual.
          </p>

          {/* Cards de matérias de exemplo */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {MATERIA_EXEMPLOS.map(m => (
              <div
                key={m.nome}
                className="rounded-2xl p-4 text-left relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${m.cor}30 0%, ${m.cor}15 100%)`, border: `1px solid ${m.cor}30` }}
              >
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-white font-semibold text-sm">{m.nome}</p>
                <p className="text-white/50 text-xs">Fichas disponíveis</p>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full opacity-20" style={{ background: m.cor }} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-indigo-300 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Nenhum cadastro necessário — só o código da turma!</span>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Fichas Desenhadas</h1>
            <p className="text-indigo-300 text-sm mt-1">Sistema de tarefas escolares</p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-4">
                <Hash className="w-6 h-6 text-indigo-300" />
              </div>
              <h2 className="text-xl font-bold text-white">Acessar Turma</h2>
              <p className="text-indigo-300 text-sm mt-1">Digite o código da sua turma</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/15 border border-red-400/25 rounded-2xl">
                <p className="text-sm text-red-300 text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleAccess} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-indigo-200 mb-2">
                  Código da Turma
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: TURMA6A"
                  required
                  maxLength={20}
                  className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-center text-xl font-bold tracking-[.3em] uppercase font-mono"
                />
                <p className="text-xs text-indigo-400 mt-2 text-center">
                  Código fornecido pelo representante da turma
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.trim().length < 3}
                className="w-full py-4 px-4 rounded-2xl gradient-primary text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Ver Fichas da Turma
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Sou professor ou gestor — fazer login
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-indigo-400/60 mt-6">
            AppTarefas © {new Date().getFullYear()} — Fichas Desenhadas
          </p>
        </div>
      </div>
    </div>
  )
}
