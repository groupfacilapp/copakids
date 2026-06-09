'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useFigurinhaStore, formatBirthDate, getPlayerNumber } from '@/lib/store'
import { FigurinhaCard } from '@/components/FigurinhaCard'

/* ─── Step transition variants ─── */
const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '32%' : '-32%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-32%' : '32%',
    opacity: 0,
    transition: { duration: 0.22 },
  }),
}

/* ─── Progress indicator ─── */
function StepProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="px-4 pt-5 pb-2 max-w-mobile" style={{ margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-2">
        <span
          style={{
            fontFamily: 'var(--font-barlow)',
            fontSize: 13,
            fontWeight: 700,
            color: 'rgba(13,27,75,0.6)',
          }}
        >
          Passo {current} de {total}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            color: '#0D1B4B',
            letterSpacing: 1,
          }}
        >
          {pct}%
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-2.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Photo upload modal ─── */
function PhotoModal({ photo, onClose }: { photo: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-glass max-w-mobile w-full p-6"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', damping: 22, stiffness: 280 } }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-center mb-4"
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 26,
            color: '#0D1B4B',
            letterSpacing: 1,
          }}
        >
          ⚠️ AVISO IMPORTANTE
        </div>
        {/* Preview */}
        <div
          className="mx-auto mb-4 overflow-hidden rounded-2xl"
          style={{
            width: 140,
            height: 140,
            border: '3px solid #E8EAF0',
          }}
        >
          <img
            src={photo}
            alt="Foto selecionada"
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>
        <p
          className="text-center mb-5"
          style={{
            fontFamily: 'var(--font-barlow)',
            fontSize: 15,
            color: '#0D1B4B',
            lineHeight: 1.55,
          }}
        >
          A foto precisa ser <strong>somente da pessoa</strong>, sem outras pessoas no enquadramento.{' '}
          Certifique-se que o rosto está bem visível e iluminado.
        </p>
        <button className="btn-primary" onClick={onClose}>
          ✅ ENTENDI
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ─── Loading photo screen ─── */
const LOADING_MSGS = [
  'Esse tem cara de jogador caro hein... 🤑',
  'Hmm, essa foto tem energia de artilheiro! ⚽',
  'Processando o craque... pode ser titular! 🏆',
  'Analisando o talento... nota 10 garantida! ⭐',
]

function PhotoLoading({ photo }: { photo: string }) {
  const [progress, setProgress] = useState(0)
  const [msgIdx] = useState(() => Math.floor(Math.random() * LOADING_MSGS.length))

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(timer); return 100 }
        return p + Math.random() * 12 + 4
      })
    }, 120)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="card-glass p-6 text-center">
      <div
        style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 28,
          color: '#0D1B4B',
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        CARREGANDO FOTO...
      </div>
      <div
        className="mx-auto mb-4 overflow-hidden rounded-2xl"
        style={{ width: 130, height: 130, border: '3px solid #E8EAF0' }}
      >
        <img
          src={photo}
          alt="Carregando"
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'top center' }}
        />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-barlow)',
          fontSize: 14.5,
          fontWeight: 600,
          color: '#0D1B4B',
          marginBottom: 14,
          fontStyle: 'italic',
        }}
      >
        {LOADING_MSGS[msgIdx]}
      </p>
      <div className="progress-track" style={{ height: 8, borderRadius: 99 }}>
        <div
          className="progress-fill"
          style={{ width: `${Math.min(progress, 100)}%`, borderRadius: 99 }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-barlow)',
          fontSize: 12,
          color: 'rgba(13,27,75,0.5)',
          marginTop: 6,
          fontWeight: 600,
        }}
      >
        Carregando... {Math.min(Math.round(progress), 100)}%
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function CriarPage() {
  const router = useRouter()
  const store = useFigurinhaStore()

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)

  // Local state (save to store on final confirm)
  const [name, setName] = useState(store.name)
  const [photo, setPhoto] = useState<string | null>(store.photo)
  const [showModal, setShowModal] = useState(false)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)

  const [birthDay, setBirthDay] = useState(store.birthDay)
  const [birthMonth, setBirthMonth] = useState(store.birthMonth)
  const [birthYear, setBirthYear] = useState(store.birthYear)
  const [email, setEmail] = useState(store.email)

  const [club, setClub] = useState(store.club)
  const [weight, setWeight] = useState(store.weight)
  const [height, setHeight] = useState(store.height)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  /* ── Photo handling ── */
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const b64 = e.target?.result as string
      setIsLoadingPhoto(true)
      setTimeout(() => {
        setPhoto(b64)
        setIsLoadingPhoto(false)
        setShowModal(true)
        setErrors((prev) => ({ ...prev, photo: '' }))
      }, 2200)
    }
    reader.readAsDataURL(file)
  }, [])

  /* ── Navigation ── */
  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Digite o nome do craque'
    if (!photo) e.photo = 'Envie a foto do craque'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e: Record<string, string> = {}
    if (!birthDay) e.birthDay = 'Selecione o dia'
    if (!birthMonth) e.birthMonth = 'Selecione o mês'
    if (!birthYear) e.birthYear = 'Selecione o ano'
    if (!email.trim()) e.email = 'Digite seu e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate3 = () => {
    const e: Record<string, string> = {}
    if (!club.trim()) e.club = 'Digite o clube'
    if (!weight.trim()) e.weight = 'Digite o peso'
    if (!height.trim()) e.height = 'Digite a altura'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validate1()) return
    if (step === 2 && !validate2()) return
    if (step === 3 && !validate3()) return
    if (step < 4) goTo(step + 1)
  }

  const handleConfirm = () => {
    store.setAll({
      name: name.trim(),
      photo,
      birthDay,
      birthMonth,
      birthYear,
      email: email.trim(),
      club: club.trim(),
      weight,
      height,
    })
    router.push('/gerando')
  }

  const birthDate = formatBirthDate(birthDay, birthMonth, birthYear)
  const playerNumber = getPlayerNumber(name)

  /* ─── Months ─── */
  const MONTHS = [
    ['01', 'Janeiro'], ['02', 'Fevereiro'], ['03', 'Março'], ['04', 'Abril'],
    ['05', 'Maio'], ['06', 'Junho'], ['07', 'Julho'], ['08', 'Agosto'],
    ['09', 'Setembro'], ['10', 'Outubro'], ['11', 'Novembro'], ['12', 'Dezembro'],
  ]

  return (
    <main className="min-h-screen bg-hero bg-hero-mesh flex flex-col">
      <StepProgress current={step} total={4} />

      <div className="flex-1 flex flex-col justify-center px-4 pb-8 max-w-mobile" style={{ margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >

            {/* ══════════════════ STEP 1 ══════════════════ */}
            {step === 1 && (
              <div className="card-glass p-6">
                <div className="text-center mb-5">
                  <div style={{ fontSize: 40, marginBottom: 6 }}>✏️</div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 32,
                      color: '#0D1B4B',
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}
                  >
                    QUAL O NOME DO CRAQUE?
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-barlow)',
                      fontSize: 14,
                      color: 'rgba(13,27,75,0.6)',
                      marginTop: 4,
                    }}
                  >
                    O nome que vai aparecer na figurinha
                  </p>
                </div>

                {/* Name input */}
                <div className="mb-5">
                  <input
                    className={`copa-input ${errors.name ? 'error' : ''}`}
                    type="text"
                    placeholder="Nome e sobrenome"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                    }}
                    maxLength={28}
                    autoComplete="off"
                  />
                  {errors.name && (
                    <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>
                      ⚠ {errors.name}
                    </p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="mb-1">
                  <label
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 15,
                      letterSpacing: 1,
                      color: '#0D1B4B',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    FOTO DO CRAQUE
                  </label>

                  {/* If loading */}
                  {isLoadingPhoto && <PhotoLoading photo={photo || ''} />}

                  {/* If has photo (not loading) */}
                  {photo && !isLoadingPhoto && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(0,155,58,0.07)', border: '2px solid rgba(0,155,58,0.25)' }}>
                      <div
                        className="flex-shrink-0 overflow-hidden rounded-xl"
                        style={{ width: 64, height: 64 }}
                      >
                        <img src={photo} alt="Foto" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'top center' }} />
                      </div>
                      <div className="flex-1">
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#009B3A' }}>✅ Foto carregada!</div>
                        <div style={{ fontSize: 12.5, color: 'rgba(13,27,75,0.5)', fontWeight: 500 }}>Toque para trocar a foto</div>
                      </div>
                      <button
                        onClick={() => galleryRef.current?.click()}
                        style={{
                          background: 'transparent',
                          border: '2px solid rgba(13,27,75,0.2)',
                          borderRadius: 10,
                          padding: '6px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0D1B4B',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-barlow)',
                        }}
                      >
                        TROCAR
                      </button>
                    </div>
                  )}

                  {/* If no photo */}
                  {!photo && !isLoadingPhoto && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className="upload-zone"
                        onClick={() => galleryRef.current?.click()}
                      >
                        <span style={{ fontSize: 32 }}>🖼️</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-barlow)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#0D1B4B',
                            textAlign: 'center',
                            lineHeight: 1.3,
                          }}
                        >
                          Enviar foto<br />
                          <span style={{ fontWeight: 500, fontSize: 11, color: 'rgba(13,27,75,0.5)' }}>
                            DO ROSTO, não de corpo
                          </span>
                        </span>
                      </button>
                      <button
                        className="upload-zone"
                        onClick={() => cameraRef.current?.click()}
                      >
                        <span style={{ fontSize: 32 }}>📷</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-barlow)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#0D1B4B',
                          }}
                        >
                          Câmera
                        </span>
                      </button>
                    </div>
                  )}

                  {errors.photo && (
                    <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>
                      ⚠ {errors.photo}
                    </p>
                  )}
                </div>

                {/* Hidden inputs */}
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />

                <div className="mt-6">
                  <button className="btn-primary" onClick={handleNext}>
                    PRÓXIMO →
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════ STEP 2 ══════════════════ */}
            {step === 2 && (
              <div className="card-glass p-6">
                <div className="text-center mb-5">
                  <div style={{ fontSize: 40, marginBottom: 6 }}>🎂</div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 32,
                      color: '#0D1B4B',
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}
                  >
                    DATA DE NASCIMENTO
                  </h2>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontSize: 14, color: 'rgba(13,27,75,0.6)', marginTop: 4 }}>
                    Pra calcular a idade na figurinha
                  </p>
                </div>

                {/* Date selects */}
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 5 }}>DIA</label>
                      <select
                        className={`copa-select ${errors.birthDay ? 'error' : ''}`}
                        value={birthDay}
                        onChange={(e) => { setBirthDay(e.target.value); setErrors((p) => ({ ...p, birthDay: '' })) }}
                      >
                        <option value="">--</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 5 }}>MÊS</label>
                      <select
                        className={`copa-select ${errors.birthMonth ? 'error' : ''}`}
                        value={birthMonth}
                        onChange={(e) => { setBirthMonth(e.target.value); setErrors((p) => ({ ...p, birthMonth: '' })) }}
                      >
                        <option value="">--</option>
                        {MONTHS.map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 5 }}>ANO</label>
                      <select
                        className={`copa-select ${errors.birthYear ? 'error' : ''}`}
                        value={birthYear}
                        onChange={(e) => { setBirthYear(e.target.value); setErrors((p) => ({ ...p, birthYear: '' })) }}
                      >
                        <option value="">----</option>
                        {Array.from({ length: 107 }, (_, i) => 2026 - i).map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
                    <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>
                      ⚠ Preencha a data completa
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 15,
                      letterSpacing: 1,
                      color: '#0D1B4B',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    SEU MELHOR E-MAIL
                  </label>
                  <input
                    className={`copa-input ${errors.email ? 'error' : ''}`}
                    type="email"
                    inputMode="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>
                      ⚠ {errors.email}
                    </p>
                  )}
                  <p style={{ fontSize: 11.5, color: 'rgba(13,27,75,0.45)', marginTop: 5, fontWeight: 500 }}>
                    📩 Você receberá o arquivo por aqui após o pagamento
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary" onClick={() => goTo(1)}>← VOLTAR</button>
                  <button className="btn-primary" onClick={handleNext}>PRÓXIMO →</button>
                </div>
              </div>
            )}

            {/* ══════════════════ STEP 3 ══════════════════ */}
            {step === 3 && (
              <div className="card-glass p-6">
                <div className="text-center mb-5">
                  <div style={{ fontSize: 40, marginBottom: 6 }}>⭐</div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 32,
                      color: '#0D1B4B',
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}
                  >
                    CLUBE E DADOS
                  </h2>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontSize: 14, color: 'rgba(13,27,75,0.6)', marginTop: 4 }}>
                    O clube do coração e os dados pra figurinha
                  </p>
                </div>

                <div className="mb-4">
                  <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 15, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 6 }}>CLUBE DO CORAÇÃO</label>
                  <input
                    className={`copa-input ${errors.club ? 'error' : ''}`}
                    type="text"
                    placeholder="Digite o nome do clube..."
                    value={club}
                    onChange={(e) => { setClub(e.target.value); setErrors((p) => ({ ...p, club: '' })) }}
                    maxLength={32}
                  />
                  {errors.club && (
                    <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>⚠ {errors.club}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 15, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 6 }}>PESO (KG)</label>
                    <input
                      className={`copa-input ${errors.weight ? 'error' : ''}`}
                      type="number"
                      inputMode="numeric"
                      placeholder="ex: 25"
                      value={weight}
                      onChange={(e) => { setWeight(e.target.value); setErrors((p) => ({ ...p, weight: '' })) }}
                      min="1"
                      max="300"
                    />
                    {errors.weight && (
                      <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>⚠ {errors.weight}</p>
                    )}
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-bebas)', fontSize: 15, letterSpacing: 1, color: '#0D1B4B', display: 'block', marginBottom: 6 }}>ALTURA (CM)</label>
                    <input
                      className={`copa-input ${errors.height ? 'error' : ''}`}
                      type="number"
                      inputMode="numeric"
                      placeholder="ex: 120"
                      value={height}
                      onChange={(e) => { setHeight(e.target.value); setErrors((p) => ({ ...p, height: '' })) }}
                      min="30"
                      max="250"
                    />
                    {errors.height && (
                      <p style={{ color: '#E53E3E', fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>⚠ {errors.height}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary" onClick={() => goTo(2)}>← VOLTAR</button>
                  <button className="btn-primary" onClick={handleNext}>PRÓXIMO →</button>
                </div>
              </div>
            )}

            {/* ══════════════════ STEP 4 — REVIEW ══════════════════ */}
            {step === 4 && (
              <div className="card-glass p-6">
                <div className="text-center mb-4">
                  <div style={{ fontSize: 36, marginBottom: 6 }}>👀</div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 30,
                      color: '#0D1B4B',
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}
                  >
                    CONFIRA SEUS DADOS
                  </h2>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontSize: 13.5, color: 'rgba(13,27,75,0.6)', marginTop: 4 }}>
                    A figurinha será gerada com esses dados
                  </p>
                </div>

                {/* Warning */}
                <div
                  className="flex items-start gap-3 rounded-2xl mb-5"
                  style={{ background: 'rgba(13,27,75,0.06)', padding: '12px 14px', border: '1.5px solid rgba(13,27,75,0.12)' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontSize: 13, color: '#0D1B4B', fontWeight: 600, lineHeight: 1.45 }}>
                    Não fazemos alterações após a aprovação e pagamento. Revise bem!
                  </p>
                </div>

                {/* Preview card */}
                <div className="flex justify-center mb-5">
                  <FigurinhaCard
                    name={name || 'SEU NOME'}
                    photo={photo}
                    birthDate={birthDate}
                    height={height}
                    weight={weight}
                    club={club}
                    number={playerNumber}
                    size="md"
                  />
                </div>

                {/* Data rows */}
                <div
                  className="flex flex-col gap-2 mb-5 rounded-2xl"
                  style={{ background: 'rgba(13,27,75,0.04)', padding: '14px 16px', border: '1.5px solid rgba(13,27,75,0.08)' }}
                >
                  {[
                    { label: 'NOME', value: name || '—' },
                    { label: 'NASCIMENTO', value: birthDate || '—' },
                    { label: 'PESO', value: weight ? `${weight} kg` : '—' },
                    { label: 'ALTURA', value: height ? `${height} cm` : '—' },
                    { label: 'CLUBE', value: club || '—' },
                    { label: 'E-MAIL', value: email || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 14, letterSpacing: 1, color: 'rgba(13,27,75,0.5)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-barlow)', fontSize: 14, fontWeight: 700, color: '#0D1B4B', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-primary mb-3"
                  onClick={handleConfirm}
                  style={{ fontSize: 18, background: 'linear-gradient(135deg, #009B3A, #007A2E)', boxShadow: '0 10px 40px rgba(0,155,58,0.4)' }}
                >
                  ENTENDI, GERAR FIGURINHA ⚽
                </button>
                <button className="btn-secondary" onClick={() => goTo(3)}>
                  ← CORRIGIR DADOS
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Photo modal */}
      <AnimatePresence>
        {showModal && photo && (
          <PhotoModal photo={photo} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </main>
  )
}
