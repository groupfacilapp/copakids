'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface OrderCard {
  id: string
  nome: string | null
  dados_figurinha: Record<string, string> | null
  created_at: string
  download_token: string
  preview_url: string | null
}

interface AreaData {
  nome: string
  orders: OrderCard[]
  has_pdf: boolean
}

type Tab = 'figurinhas' | 'pdfs'

export default function AreaPage() {
  const params = useParams()
  const token = params?.token as string

  const [data, setData]     = useState<AreaData | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'pending' | 'ok'>('loading')
  const [tab, setTab]       = useState<Tab>('figurinhas')

  useEffect(() => {
    if (!token) return
    fetch(`/api/area/data/${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.pending) { setStatus('pending'); return }
        if (json.error)   { setStatus('error');   return }
        setData(json)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') return <Screen><Loading /></Screen>
  if (status === 'error')   return <Screen><ErrorMsg /></Screen>
  if (status === 'pending') return <Screen><Pending token={token} /></Screen>
  if (!data) return null

  const primeiroNome = data.nome.split(' ')[0]
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'figurinhas', label: 'Figurinhas',  icon: '🗂️' },
    { id: 'pdfs',       label: 'PDFs',        icon: '📄' },
  ]

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={{ fontSize: 20 }}>⚽</span>
          <span style={s.navTitle}>MINHA ÁREA</span>
        </div>
        <a href="/" style={s.sairBtn}>Sair</a>
      </nav>

      {/* Saudação */}
      <div style={s.greeting}>
        <h2 style={s.greetingTitle}>OLÁ! TUDO PRONTINHO<br />PRA VOCÊ BAIXAR 🏆</h2>
        <p style={s.greetingSub}>
          {data.orders.length} {data.orders.length === 1 ? 'arquivo liberado' : 'arquivos liberados'}
        </p>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...s.tabBtn, ...(tab === t.id ? s.tabBtnActive : {}) }}
          >
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={s.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={s.content}>
        {tab === 'figurinhas' && (
          <>
            <SectionHeader title="🏆 FIGURINHAS" count={data.orders.length} />
            <div style={s.cardsRow}>
              {data.orders.map(o => (
                <FigurinhaCard key={o.id} order={o} />
              ))}
              <NewCard />
            </div>
          </>
        )}

        {tab === 'pdfs' && (
          <>
            <SectionHeader title="📄 PDFS" count={data.orders.length} />
            {data.orders.map(o => (
              <PdfCard key={o.id} order={o} />
            ))}
          </>
        )}

        {/* Quer mais */}
        <div style={s.querMais}>
          <p style={s.querMaisTitle}>Quer mais?</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Olha minha figurinha da Copa 2026! 🏆 copa-figurinhas2026.vercel.app`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={s.btnShare}
          >
            💬 COMPARTILHAR COM AMIGOS
          </a>
          <a href="/" style={s.btnBuyAgain}>
            🛒 COMPRAR DE NOVO
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function FigurinhaCard({ order }: { order: OrderCard }) {
  const nome = order.nome ?? 'Figurinha'
  const d = order.dados_figurinha ?? {}
  const whatsappText = encodeURIComponent(`Olha minha figurinha da Copa 2026! 🏆`)

  return (
    <div style={s.card}>
      {/* Preview */}
      <div style={s.cardPreview}>
        {order.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={order.preview_url} alt={nome} style={s.cardImg} />
        ) : (
          <div style={s.cardImgPlaceholder}>
            <span style={{ fontSize: 36 }}>⚽</span>
          </div>
        )}
      </div>

      {/* Info */}
      <p style={s.cardNome}>{nome}</p>
      {d.clube && <p style={s.cardSub}>{d.clube}</p>}

      <a href={`/api/download/${order.download_token}`} download style={s.btnDownload}>
        ⬇ BAIXAR
      </a>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        style={s.btnWhatsapp}
      >
        <WhatsappIcon /> ENVIAR NO WHATSAPP
      </a>
    </div>
  )
}

function NewCard() {
  return (
    <a href="/" style={s.newCard}>
      <div style={s.newCardPlus}>+</div>
      <p style={s.newCardLabel}>CRIAR FIGURINHA</p>
    </a>
  )
}

function PdfCard({ order }: { order: OrderCard }) {
  const nome = order.nome ?? 'Figurinha'
  const whatsappText = encodeURIComponent(`Olha minha figurinha da Copa 2026! 🏆`)

  return (
    <div style={s.pdfCard}>
      {/* Thumbnail */}
      <div style={s.pdfThumb}>
        {order.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={order.preview_url} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>📄</div>
        )}
      </div>

      {/* Info + botões */}
      <div style={{ flex: 1 }}>
        <p style={s.pdfTitle}>PDF — {nome}</p>
        <a href={`/api/download/pdf/${order.download_token}`} download style={s.btnDownload}>
          ⬇ BAIXAR
        </a>
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...s.btnWhatsapp, marginTop: 8 }}
        >
          <WhatsappIcon /> ENVIAR NO WHATSAPP
        </a>
      </div>
    </div>
  )
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div style={s.sectionHeader}>
      <span style={s.sectionTitle}>{title}</span>
      <span style={s.sectionCount}>{count} {count === 1 ? 'item' : 'itens'}</span>
    </div>
  )
}

function WhatsappIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      {children}
    </div>
  )
}

function Loading() {
  return <div style={{ fontSize: 32, color: '#0a3d8f' }}>⏳</div>
}

function ErrorMsg() {
  return (
    <div style={{ textAlign: 'center', color: '#0a3d8f' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
      <p style={{ fontWeight: 700 }}>Link não encontrado</p>
      <a href="/area" style={{ color: '#0a3d8f', fontSize: 14 }}>Recuperar acesso por email</a>
    </div>
  )
}

function Pending({ token }: { token: string }) {
  return (
    <div style={{ textAlign: 'center', color: '#0a3d8f', maxWidth: 320, padding: '0 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
      <p style={{ fontWeight: 700, fontSize: 18 }}>Aguardando confirmação do pagamento</p>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>Quando confirmado você receberá um email. Pode levar alguns minutos.</p>
      <a href={`/area/${token}`} style={{ display: 'inline-block', marginTop: 16, background: '#0a3d8f', color: '#fff', padding: '12px 24px', borderRadius: 50, textDecoration: 'none', fontWeight: 700 }}>
        🔄 Verificar novamente
      </a>
    </div>
  )
}

/* ── Estilos ── */
const s = {
  page: {
    minHeight: '100vh',
    background: '#FFD600',
    fontFamily: '"Arial", sans-serif',
    paddingBottom: 40,
  },
  nav: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: '14px 20px',
    background: '#FFD600',
  },
  navLeft: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  navTitle: {
    fontWeight: 900,
    fontSize: 14,
    color: '#0a3d8f',
    letterSpacing: 1,
  },
  sairBtn: {
    fontWeight: 700,
    fontSize: 14,
    color: '#0a3d8f',
    textDecoration: 'underline' as const,
  },
  greeting: {
    padding: '4px 20px 20px',
    textAlign: 'center' as const,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#0a3d8f',
    letterSpacing: 1,
    margin: '0 0 6px',
    lineHeight: 1.3,
    textTransform: 'uppercase' as const,
  },
  greetingSub: {
    fontSize: 13,
    color: '#0a3d8f',
    margin: 0,
    opacity: 0.7,
  },
  tabBar: {
    display: 'flex' as const,
    gap: 10,
    padding: '0 16px 16px',
    overflowX: 'auto' as const,
  },
  tabBtn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    background: 'rgba(255,255,255,0.5)',
    border: '2px solid transparent',
    borderRadius: 14,
    padding: '12px 18px',
    cursor: 'pointer' as const,
    minWidth: 80,
    gap: 6,
    transition: 'all 0.15s',
  },
  tabBtnActive: {
    background: '#fff',
    border: '2px solid #0a3d8f',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0a3d8f',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  content: {
    padding: '0 16px',
  },
  sectionHeader: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 900,
    fontSize: 14,
    color: '#0a3d8f',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    color: '#0a3d8f',
    opacity: 0.6,
  },
  cardsRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    padding: 14,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  cardPreview: {
    width: '100%',
    aspectRatio: '3/4',
    borderRadius: 12,
    overflow: 'hidden' as const,
    marginBottom: 10,
    background: '#f0f0f0',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  cardImgPlaceholder: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '100%',
    height: '100%',
  },
  cardNome: {
    fontWeight: 900,
    fontSize: 13,
    color: '#0a3d8f',
    textAlign: 'center' as const,
    margin: '0 0 2px',
    textTransform: 'uppercase' as const,
  },
  cardSub: {
    fontSize: 11,
    color: '#666',
    margin: '0 0 12px',
    textAlign: 'center' as const,
  },
  newCard: {
    background: 'rgba(255,255,255,0.5)',
    border: '2px dashed rgba(10,61,143,0.3)',
    borderRadius: 18,
    padding: 14,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    textDecoration: 'none',
    minHeight: 200,
    cursor: 'pointer' as const,
  },
  newCardPlus: {
    width: 50,
    height: 50,
    borderRadius: 25,
    background: 'rgba(10,61,143,0.1)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: 26,
    color: '#0a3d8f',
    marginBottom: 8,
  },
  newCardLabel: {
    fontSize: 11,
    fontWeight: 900,
    color: '#0a3d8f',
    textAlign: 'center' as const,
    letterSpacing: 0.5,
    margin: 0,
  },
  pdfCard: {
    background: '#fff',
    borderRadius: 18,
    padding: 16,
    display: 'flex' as const,
    gap: 14,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  pdfThumb: {
    width: 90,
    height: 120,
    borderRadius: 10,
    background: '#f0f0f0',
    flexShrink: 0,
    overflow: 'hidden' as const,
  },
  pdfTitle: {
    fontWeight: 900,
    fontSize: 13,
    color: '#0a3d8f',
    margin: '0 0 12px',
    textTransform: 'uppercase' as const,
  },
  btnDownload: {
    display: 'block',
    textAlign: 'center' as const,
    background: '#0a3d8f',
    color: '#fff',
    fontWeight: 900,
    fontSize: 12,
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: 50,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  btnWhatsapp: {
    display: 'block',
    textAlign: 'center' as const,
    background: '#25D366',
    color: '#fff',
    fontWeight: 900,
    fontSize: 12,
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: 50,
    letterSpacing: 0.5,
  },
  querMais: {
    background: '#fff',
    borderRadius: 18,
    padding: '20px 16px',
    marginTop: 8,
    textAlign: 'center' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  querMaisTitle: {
    fontSize: 14,
    color: '#444',
    margin: '0 0 14px',
  },
  btnShare: {
    display: 'block',
    background: '#25D366',
    color: '#fff',
    fontWeight: 900,
    fontSize: 13,
    textDecoration: 'none',
    padding: '14px',
    borderRadius: 50,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  btnBuyAgain: {
    display: 'block',
    background: 'transparent',
    border: '2px solid #0a3d8f',
    color: '#0a3d8f',
    fontWeight: 900,
    fontSize: 13,
    textDecoration: 'none',
    padding: '12px',
    borderRadius: 50,
    letterSpacing: 0.5,
  },
}
