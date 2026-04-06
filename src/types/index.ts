export type Role = 'admin' | 'coordinator' | 'representative'

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  turma_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Turma {
  id: string
  nome: string
  serie: string
  turno: 'Matutino' | 'Vespertino' | 'Noturno' | 'Integral'
  access_code: string
  representative_user_id: string | null
  active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Professor {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  active: boolean
  created_at: string
  updated_at: string
  materias?: Materia[]
}

export interface Materia {
  id: string
  nome: string
  descricao: string | null
  cor: string
  active: boolean
  created_at: string
  updated_at: string
}

export type TipoTarefa = 'Tarefa' | 'Prova' | 'Trabalho' | 'Projeto' | 'Apresentação' | 'Exercício' | 'Seminário' | 'Outro'
export type Prioridade = 'Baixa' | 'Normal' | 'Alta' | 'Urgente'

export interface Tarefa {
  id: string
  turma_id: string
  professor_id: string
  materia_id: string
  titulo: string
  descricao: string | null
  observacoes: string | null
  tipo_tarefa: TipoTarefa
  prioridade: Prioridade
  data_aula: string
  prazo_entrega: string | null
  criado_por_user_id: string | null
  created_at: string
  updated_at: string
  turmas?: Turma
  professores?: Professor
  materias?: Materia
  profiles?: Profile
}

export interface TarefaFiltros {
  turma_id?: string
  professor_id?: string
  materia_id?: string
  tipo_tarefa?: string
  prioridade?: string
  data_inicio?: string
  data_fim?: string
  busca?: string
}

export interface DashboardStats {
  totalTurmas: number
  totalProfessores: number
  totalMaterias: number
  totalRepresentantes: number
  tarefasHoje: number
  tarefasSemana: number
  tarefasMes: number
}
