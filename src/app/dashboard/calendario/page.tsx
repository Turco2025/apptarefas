import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarioClient from './CalendarioClient'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  let query = supabase
    .from('tarefas')
    .select('*, turmas(nome), professores(nome), materias(nome, cor)')
    .order('data_aula', { ascending: true })

  if (profile.role === 'representative' && profile.turma_id) {
    query = query.eq('turma_id', profile.turma_id)
  }

  const { data: tarefas } = await query

  return (
    <CalendarioClient
      profile={profile}
      tarefas={tarefas || []}
    />
  )
}
