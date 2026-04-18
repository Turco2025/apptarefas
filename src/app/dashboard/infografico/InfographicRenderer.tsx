'use client'

import { useMemo } from 'react'

interface AgentData {
  materia: string
  topico: string
  subtopico: string
  conteudo: string
}

interface InfographicRendererProps {
  data: AgentData
}

function splitConteudo(conteudo: string) {
  const sentences = conteudo.split(/(?<=[.!?])\s+/)
  const total = sentences.length

  const enunciado = sentences.slice(0, Math.min(3, Math.ceil(total * 0.35))).join(' ')
  const remaining = sentences.slice(Math.min(3, Math.ceil(total * 0.35)))

  const third = Math.ceil(remaining.length / 3)
  const passo1 = remaining.slice(0, third).join(' ') || 'Identifique os dados do problema e escreva as grandezas físicas relevantes.'
  const passo2 = remaining.slice(third, third * 2).join(' ') || 'Aplique o princípio ou lei correspondente ao subtópico estudado.'
  const passo3 = remaining.slice(third * 2).join(' ') || 'Calcule e conclua a resposta com base nos dados e fórmulas aplicadas.'

  return { enunciado, passo1, passo2, passo3 }
}

const SUBJECT_META: Record<string, { emoji: string; accent: string; icon: string }> = {
  física:      { emoji: '⚛️', accent: '#2563eb', icon: '🔭' },
  química:     { emoji: '🧪', accent: '#7c3aed', icon: '⚗️' },
  biologia:    { emoji: '🧬', accent: '#16a34a', icon: '🔬' },
  matemática:  { emoji: '📐', accent: '#d97706', icon: '∑' },
  história:    { emoji: '📜', accent: '#b45309', icon: '🏛️' },
  geografia:   { emoji: '🌎', accent: '#0891b2', icon: '🗺️' },
  português:   { emoji: '📖', accent: '#dc2626', icon: '✍️' },
  inglês:      { emoji: '🇬🇧', accent: '#1d4ed8', icon: '🗣️' },
  filosofia:   { emoji: '🦉', accent: '#6d28d9', icon: '💭' },
  sociologia:  { emoji: '👥', accent: '#0f766e', icon: '🤝' },
}

function getSubjectMeta(materia: string) {
  const key = materia.toLowerCase()
  for (const [k, v] of Object.entries(SUBJECT_META)) {
    if (key.includes(k)) return v
  }
  return { emoji: '📚', accent: '#4f46e5', icon: '🎓' }
}

export default function InfographicRenderer({ data }: InfographicRendererProps) {
  const meta = useMemo(() => getSubjectMeta(data.materia), [data.materia])
  const { enunciado, passo1, passo2, passo3 } = useMemo(() => splitConteudo(data.conteudo), [data.conteudo])

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
      }}
    >
      {/* Paper texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.018,
        backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%)',
        backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top stripe decoration */}
      <div style={{ display: 'flex', height: '8px', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 2, backgroundColor: meta.accent }} />
        <div style={{ flex: 1, backgroundColor: '#f97316' }} />
        <div style={{ flex: 1, backgroundColor: '#ef4444' }} />
        <div style={{ flex: 1, backgroundColor: '#eab308' }} />
        <div style={{ flex: 1, backgroundColor: '#22c55e' }} />
      </div>

      <div style={{ padding: '28px 32px 32px', position: 'relative', zIndex: 1 }}>

        {/* ── TITLE BLOCK ── */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            backgroundColor: '#f8fafc', border: `2px solid ${meta.accent}22`,
            borderRadius: '16px', padding: '6px 18px', marginBottom: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>{meta.emoji}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: meta.accent,
            }}>
              {data.materia}
            </span>
            <span style={{ fontSize: '20px' }}>{meta.icon}</span>
          </div>

          <h1 style={{
            fontSize: '30px', fontWeight: 900, lineHeight: 1.15,
            color: '#0f172a', margin: '0 0 6px',
            textShadow: `2px 2px 0 ${meta.accent}18`,
          }}>
            <span style={{ color: meta.accent }}>{data.subtopico}</span>
          </h1>

          <p style={{
            fontSize: '13px', color: '#64748b', margin: 0,
            fontStyle: 'italic', fontWeight: 500,
          }}>
            {data.topico}
          </p>

          {/* Decorative underline */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
            <div style={{ width: '40px', height: '3px', borderRadius: '99px', backgroundColor: meta.accent }} />
            <div style={{ width: '20px', height: '3px', borderRadius: '99px', backgroundColor: '#f97316' }} />
            <div style={{ width: '10px', height: '3px', borderRadius: '99px', backgroundColor: '#eab308' }} />
          </div>
        </div>

        {/* ── ENUNCIADO ── */}
        <div style={{
          background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          position: 'relative',
        }}>
          {/* Torn-paper top edge simulation */}
          <div style={{
            position: 'absolute', top: '-1px', left: '8px', right: '8px', height: '3px',
            background: 'repeating-linear-gradient(90deg, #f8fafc 0px, #f8fafc 6px, transparent 6px, transparent 12px)',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              backgroundColor: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>📋</span>
            </div>
            <div>
              <div style={{
                fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: meta.accent, marginBottom: '6px',
              }}>
                ENUNCIADO
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1e293b', lineHeight: 1.65, fontWeight: 400 }}>
                {enunciado || data.conteudo.slice(0, 300)}
              </p>
            </div>
          </div>
        </div>

        {/* ── CENTRAL VISUAL SCENARIO ── */}
        <div style={{
          background: `linear-gradient(135deg, ${meta.accent}0a 0%, ${meta.accent}18 100%)`,
          border: `2px solid ${meta.accent}30`,
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          minHeight: '100px',
        }}>
          {/* Big icon */}
          <div style={{
            width: '80px', height: '80px', flexShrink: 0,
            background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}cc 100%)`,
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${meta.accent}40`,
          }}>
            <span style={{ fontSize: '38px' }}>{meta.emoji}</span>
          </div>

          {/* Central diagram */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: meta.accent, marginBottom: '8px',
            }}>
              REPRESENTAÇÃO VISUAL — {data.subtopico.toUpperCase()}
            </div>

            {/* Force/concept arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '16px', boxShadow: '0 4px 12px #2563eb40',
                }}>↑</div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb' }}>FORÇA A</span>
              </div>

              <div style={{
                flex: 1, height: '2px', borderRadius: '1px',
                background: `linear-gradient(90deg, #2563eb, ${meta.accent}, #ef4444)`,
              }} />

              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: `linear-gradient(135deg, ${meta.accent}cc, ${meta.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '22px', fontWeight: 900,
                boxShadow: `0 6px 20px ${meta.accent}50`,
              }}>
                <span style={{ fontSize: '22px' }}>{meta.icon}</span>
              </div>

              <div style={{
                flex: 1, height: '2px', borderRadius: '1px',
                background: `linear-gradient(90deg, ${meta.accent}, #ef4444, #f97316)`,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '16px', boxShadow: '0 4px 12px #ef444440',
                }}>↓</div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444' }}>FORÇA B</span>
              </div>
            </div>

            {/* Labels row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['→ Ação', '→ Reação', '⊙ Equilíbrio', '∑F = 0'].map(label => (
                <span key={label} style={{
                  fontSize: '9px', fontWeight: 600,
                  backgroundColor: `${meta.accent}15`, color: meta.accent,
                  border: `1px solid ${meta.accent}30`,
                  borderRadius: '6px', padding: '3px 8px',
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── STEP BLOCKS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Bloco 1 – red/orange */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '2px solid #fed7aa',
            borderRadius: '12px', padding: '14px',
            borderTop: '4px solid #f97316',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>1</div>
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c2410c' }}>
                DADOS E FÓRMULA
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#431407', lineHeight: 1.6 }}>
              {passo1}
            </p>
            {/* Highlight block */}
            <div style={{
              marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
              backgroundColor: '#f97316', color: 'white',
              fontSize: '11px', fontWeight: 700, textAlign: 'center',
            }}>
              F = m · a
            </div>
          </div>

          {/* Bloco 2 – blue */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '2px solid #bfdbfe',
            borderRadius: '12px', padding: '14px',
            borderTop: `4px solid ${meta.accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                backgroundColor: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>2</div>
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e40af' }}>
                CONCEITO-CHAVE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#1e3a8a', lineHeight: 1.6 }}>
              {passo2}
            </p>
            <div style={{
              marginTop: '8px', padding: '4px 8px', borderRadius: '8px',
              border: `1px dashed ${meta.accent}`, color: meta.accent,
              fontSize: '10px', fontWeight: 600, textAlign: 'center',
            }}>
              ⚖️ Equilíbrio / Princípio
            </div>
          </div>

          {/* Bloco 3 – green */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #bbf7d0',
            borderRadius: '12px', padding: '14px',
            borderTop: '4px solid #22c55e',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>3</div>
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#15803d' }}>
                RESOLUÇÃO FINAL
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#14532d', lineHeight: 1.6 }}>
              {passo3}
            </p>
            <div style={{
              marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
              backgroundColor: '#22c55e', color: 'white',
              fontSize: '11px', fontWeight: 700, textAlign: 'center',
            }}>
              ✅ Resposta encontrada!
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Visual Box + Notes ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Visual explanation – pie-like proportional */}
          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
            border: '2px solid #fde68a',
            borderRadius: '12px', padding: '14px',
            borderTop: '4px solid #eab308',
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#92400e', marginBottom: '10px' }}>
              📊 VISUALIZAÇÃO PROPORCIONAL
            </div>
            {/* Bar chart simulation */}
            {[
              { label: 'Conceito', pct: 40, color: meta.accent },
              { label: 'Fórmula', pct: 30, color: '#f97316' },
              { label: 'Cálculo', pct: 20, color: '#22c55e' },
              { label: 'Resultado', pct: 10, color: '#eab308' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#44403c' }}>{item.label}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: item.color }}>{item.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f5f5f4', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.pct}%`, height: '100%', borderRadius: '99px',
                    backgroundColor: item.color,
                    boxShadow: `0 2px 4px ${item.color}60`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Notes / Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* DICA */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #bae6fd',
              borderRadius: '12px', padding: '12px',
              borderLeft: '4px solid #0ea5e9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>💡</span>
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0369a1' }}>
                  DICA!
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#0c4a6e', lineHeight: 1.55 }}>
                Sempre identifique as grandezas físicas antes de aplicar qualquer fórmula.
                Lembre-se das unidades do SI!
              </p>
            </div>

            {/* CUIDADO */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
              border: '2px solid #fecdd3',
              borderRadius: '12px', padding: '12px',
              borderLeft: '4px solid #ef4444',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b91c1c' }}>
                  CUIDADO!
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#7f1d1d', lineHeight: 1.55 }}>
                Não confunda os termos do problema. Analise cada dado com atenção
                e verifique a coerência dimensional do resultado.
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: '20px', paddingTop: '14px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '14px' }}>🎓</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>AppTarefas</span>
              <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>Infográfico Educacional</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[data.materia, data.topico, data.subtopico].map(tag => (
              <span key={tag} style={{
                fontSize: '8px', fontWeight: 600,
                backgroundColor: `${meta.accent}12`, color: meta.accent,
                border: `1px solid ${meta.accent}25`,
                borderRadius: '6px', padding: '3px 8px',
              }}>
                #{tag}
              </span>
            ))}
          </div>

          <span style={{ fontSize: '9px', color: '#94a3b8' }}>Formato A4 · 794×1123px</span>
        </div>

        {/* Hand-drawn doodle decorations */}
        <svg style={{ position: 'absolute', top: '40px', right: '20px', opacity: 0.06 }} width="80" height="80" viewBox="0 0 80 80">
          <path d="M10,40 Q20,10 40,20 Q60,30 70,40 Q60,70 40,60 Q20,50 10,40Z" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '60px', left: '12px', opacity: 0.05 }} width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="5 4" />
          <path d="M15,30 L45,30 M30,15 L30,45" stroke="#000" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  )
}
