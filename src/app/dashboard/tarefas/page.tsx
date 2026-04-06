import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TarefasClient from './TarefasClient'

export default async function TarefasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  // Carrega dados base
  const [{ data: turmas }, { data: professores }, { data: materias }] = await Promise.all([
    supabase.from('turmas').select('id, nome, serie').eq('active', true).order('nome'),
    supabase.from('professores').select('id, nome').eq('active', true).order('nome'),
    supabase.from('materias').select('id, nome, cor').eq('active', true).order('nome'),
  ])

  // Tarefas com filtro por perfil
  let query = supabase
    .from('tarefas')
    .select('*, turmas(nome), professores(nome), materias(nome, cor), profiles(name)')
    .order('data_aula', { ascending: false })
    .limit(100)

  if (profile.role === 'representative' && profile.turma_id) {
    query = query.eq('turma_id', profile.turma_id)
  }

  const { data: tarefas } = await query

  return (
    <TarefasClient
      profile={profile}
      initialTarefas={tarefas || []}
      turmas={turmas || []}
      professores={professores || []}
      materias={materias || []}
    />
  )
}
