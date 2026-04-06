import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Cria via Admin API (requer service role key no servidor)
  // Em produção: usar SUPABASE_SERVICE_ROLE_KEY no backend
  // Por enquanto retorna sucesso para demonstração
  return NextResponse.json({
    message: 'Para criar usuários em produção, configure SUPABASE_SERVICE_ROLE_KEY e use a Admin API do Supabase.',
    data: { email, name, role }
  })
}
