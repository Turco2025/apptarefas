'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Hash, ArrowLeft, Loader2, GraduationCap, Users } from 'lucide-react'

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
      setError('Código da turma inválido ou turma inativa. Verifique com seu representante.')
      setLoading(false)
      return
    }

    // Salva no sessionStorage para acesso do aluno
    sessionStorage.setItem('aluno_turma', JSON.stringify(data))
    router.push('/aluno')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6">
      {/* Decoração */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Acesso do Aluno</h1>
          <p className="text-slate-400 mt-2">Digite o código da sua turma</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-300 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleAccess} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Código da Turma
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: TURMA6A"
                  required
                  maxLength={20}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest uppercase"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                O código é fornecido pelo representante da turma
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length < 3}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  Acessar Turma
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
