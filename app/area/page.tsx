'use client'

import { useState } from 'react'

export default function AreaPage() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await fetch('/api/area/resend-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0D1B4B 0%, #091830 60%, #050E24 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,213,0,0.2)',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #009B3A, #007030)',
            padding: '24px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, lineHeight: 1 }}>⚽</div>
          <div
            style={{
              color: '#FFD500',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 2,
              marginTop: 8,
              textTransform: 'uppercase',
            }}
          >
            Acessar Minha Figurinha
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
            Copa do Mundo 2026
          </div>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {status === 'sent' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📩</div>
              <p style={{ color: '#FFD500', fontSize: 18, fontWeight: 900, margin: '0 0 8px' }}>
                Email enviado!
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Se esse email possui uma compra confirmada, você receberá o link de acesso em instantes.
                Verifique também o spam.
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                Digite o email usado na compra e enviaremos o link da sua figurinha.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: 16,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: status === 'loading'
                      ? 'rgba(255,213,0,0.4)'
                      : 'linear-gradient(135deg, #FFD500, #FFA500)',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: 15,
                    border: 'none',
                    borderRadius: 50,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {status === 'loading' ? 'Enviando...' : '📩 Receber link por email'}
                </button>
              </form>

              {status === 'error' && (
                <p style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
                  Erro ao enviar. Tente novamente.
                </p>
              )}
            </>
          )}
        </div>

        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '14px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0 }}>
            Figurinha Copa 2026 • Produto digital exclusivo
          </p>
        </div>
      </div>
    </main>
  )
}
