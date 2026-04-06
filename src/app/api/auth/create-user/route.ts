import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verifica se o solicitante é admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 })
  }

  const body = await request.json()
  const { email, password, name, role, turma_id } = body

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const validRoles = ['admin', 'coordinator', 'representative']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Papel inválido' }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta. Configure SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Cria o usuário via Admin API
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  })

  if (createError || !newUser?.user) {
    return NextResponse.json(
      { error: createError?.message || 'Erro ao criar usuário' },
      { status: 500 }
    )
  }

  // Atualiza o perfil com role e turma_id
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ name, role, turma_id: turma_id || null })
    .eq('id', newUser.user.id)

  if (profileError) {
    // Remove o usuário criado se o perfil falhar
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json(
      { error: 'Erro ao configurar perfil do usuário' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Usuário criado com sucesso',
    data: { id: newUser.user.id, email, name, role }
  })
}
