'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const TOTAL_SECONDS = 72

const MESSAGES = [
  { at: 0,  text: '⚡ Processando a foto do craque...' },
  { at: 12, text: '🎨 Aplicando design Panini Copa 2026...' },
  { at: 26, text: '🏆 Adicionando dados da ficha técnica...' },
  { at: 42, text: '✨ Finalizando os detalhes dourados...' },
  { at: 58, text: '📦 Preparando seu arquivo...' },
  { at: 66, text: '✅ Quase pronto! Só um instante...' },
]

export default function GerandoPage() {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const start = Date.now()

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000)
      setElapsed(secs)

      // Non-linear progress: fast start, slow middle, complete at end
      let pct = 0
      if (secs <= 20) pct = (secs / 20) * 48
      else if (secs <= 55) pct = 48 + ((secs - 20) / 35) * 40
      else if (secs <= TOTAL_SECONDS) pct = 88 + ((secs - 55) / (TOTAL_SECONDS - 55)) * 12
      else pct = 100

      setProgress(Math.min(pct, 100))

      // Update message
      const idx = MESSAGES.reduce((acc, m, i) => (secs >= m.at ? i : acc), 0)
      setMsgIndex(idx)

      if (secs >= TOTAL_SECONDS) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeout(() => router.push('/sua-figurinha'), 600)
      }
    }, 500)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [router])

  const displayPct = Math.round(progress)

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #0D1B4B 0%, #091830 60%, #050E24 100%)',
      }}
    >
      {/* ── Top accent ── */}
      <div
        className="w-full flex-shrink-0"
        style={{
          height: 4,
          background: 'linear-gradient(90deg, #009B3A, #FFD500, #009B3A)',
          backgroundSize: '200% 100%',
          animation: 'shimmerSlide 2s linear infinite',
        }}
      />

      <div className="flex-1 flex flex-col justify-between max-w-mobile w-full px-4 py-8" style={{ margin: '0 auto' }}>

        {/* ── Header ── */}
        <div className="text-center mb-6">
          <div
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 38,
              color: '#FFD500',
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            GERANDO SUA FIGURINHA
          </div>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              marginTop: 6,
            }}
          >
            Não saia dessa tela — leva até 2 minutos ⏱
          </p>
        </div>

        {/* ── VSL / Video area ── */}
        <div
          className="rounded-3xl overflow-hidden flex flex-col items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            minHeight: 280,
            padding: '28px 20px',
            position: 'relative',
          }}
        >
          {/* Decorative football */}
          <div
            style={{
              fontSize: 80,
              lineHeight: 1,
              marginBottom: 16,
              filter: 'drop-shadow(0 8px 24px rgba(255,213,0,0.25))',
              animation: 'starSpin 8s linear infinite',
            }}
          >
            ⚽
          </div>

          {/* Live counter */}
          <div
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 64,
              color: '#FFD500',
              lineHeight: 1,
              letterSpacing: 2,
              filter: 'drop-shadow(0 4px 16px rgba(255,213,0,0.4))',
            }}
          >
            {displayPct}%
          </div>

          <div
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 13,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 4,
            }}
          >
            {elapsed}s decorridos
          </div>

          {/* Animated message */}
          <div
            key={msgIndex}
            className="mt-6 text-center animate-fade-in"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              minHeight: 22,
            }}
          >
            {MESSAGES[msgIndex].text}
          </div>

          {/* Pulse dots */}
          <div className="flex gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: '#FFD500',
                  animation: `pulse 1.2s ease-in-out infinite ${i * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-6">
          <div className="vsl-progress-track">
            <div
              className="vsl-progress-fill"
              style={{ width: `${displayPct}%` }}
            />
          </div>
          <div
            className="flex items-center justify-between mt-2"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <span>{elapsed}s</span>
            <span>{displayPct}%</span>
          </div>
        </div>

        {/* ── FOMO Banner ── */}
        <div
          className="rounded-2xl text-center mt-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,155,58,0.18), rgba(0,155,58,0.08))',
            border: '1.5px solid rgba(0,155,58,0.3)',
            padding: '14px 18px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 14,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.5,
            }}
          >
            🏆 Adquira sua figurinha <strong style={{ color: '#FFD500' }}>HOJE</strong> e concorra a
          </p>
          <div
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 38,
              color: '#009B3A',
              letterSpacing: 2,
              lineHeight: 1.1,
              filter: 'drop-shadow(0 2px 12px rgba(0,155,58,0.5))',
            }}
          >
            MIL REAIS
          </div>
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 2,
            }}
          >
            no dia 11/06/2026 — início dos jogos!
          </p>
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-5"
          style={{
            fontFamily: 'var(--font-barlow)',
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          Você será redirecionado automaticamente quando pronto
        </p>
      </div>
    </main>
  )
}
