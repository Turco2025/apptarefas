import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FichasClient from './FichasClient'

export default async function FichasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const turmaFilter = profile.role === 'representative' && profile.turma_id ? profile.turma_id : null

  let query = supabase
    .from('tarefas')
    .select('*, turmas(nome, serie), professores(nome), materias(nome, cor)')
    .order('data_aula', { ascending: true })

  if (turmaFilter) query = query.eq('turma_id', turmaFilter)

  const [{ data: tarefas }, { data: turmas }, { data: professores }, { data: materias }] = await Promise.all([
    query,
    supabase.from('turmas').select('id, nome, serie').eq('active', true).order('nome'),
    supabase.from('professores').select('id, nome').eq('active', true).order('nome'),
    supabase.from('materias').select('id, nome, cor').eq('active', true).order('nome'),
  ])

  return (
    <FichasClient
      profile={profile}
      initialTarefas={tarefas || []}
      turmas={turmas || []}
      professores={professores || []}
      materias={materias || []}
    />
  )
}
