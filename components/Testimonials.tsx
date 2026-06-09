'use client'

import React from 'react'

const TESTIMONIALS: BubbleProps[] = [
  {
    contact: 'Ana Paula 💛',
    time: '18:42',
    message: 'Meu filho ficou EMOCIONADO quando viu a figurinha!! Parece de verdade mesmo 😭⚽',
    side: 'sent',
  },
  {
    contact: 'Marcos Roberto',
    time: '18:44',
    message: 'Comprei pra minha filha e ela ficou chorando de felicidade 🥹🏆 Vale muito os R$12,90!!',
    side: 'received',
  },
  {
    contact: 'Juliana M. 🇧🇷',
    time: '19:10',
    message: 'Já imprimi e colei no álbum, ficou profissional demais!! Parece figurinha oficial Panini 🔥🔥',
    side: 'sent',
  },
  {
    contact: 'Carlos Eduardo',
    time: '19:35',
    message: 'O João queria ser jogador de Copa, agora ele TEM a figurinha dele!! Que ideia genial essa',
    side: 'received',
  },
  {
    contact: 'Patrícia Lima 💚',
    time: '20:18',
    message: 'Melhor presente!! Comprei pra 3 sobrinhos, todos amaram. Muito linda a figurinha ❤️⚽',
    side: 'sent',
  },
  {
    contact: 'Roberto S.',
    time: '20:55',
    message: 'Rápido, bonito, entrega na hora. Não esperava que fosse tão profissional. Nota 10 ⭐⭐⭐⭐⭐',
    side: 'received',
  },
  {
    contact: 'Fernanda B. 💛',
    time: '21:12',
    message: 'Minha filha mostrou pra toda a escola hahaha todo mundo quer fazer a delas agora 😂🏆',
    side: 'sent',
  },
  {
    contact: 'Diego Alves',
    time: '21:40',
    message: 'Fiz pra meu filho e ele foi mostrar pro treinador do futebol kkkk o treinador também quis fazer a dele',
    side: 'received',
  },
]

interface BubbleProps {
  contact: string
  time: string
  message: string
  side: 'sent' | 'received'
}

function WppBubble({ contact, time, message, side }: BubbleProps) {
  return (
    <div className={`flex ${side === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={side === 'sent' ? 'wpp-bubble-sent' : 'wpp-bubble-received'}
        style={{
          maxWidth: '82%',
          padding: '8px 10px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {side === 'received' && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#075E54',
              fontFamily: 'var(--font-barlow), system-ui, sans-serif',
            }}
          >
            {contact}
          </span>
        )}
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.45,
            color: '#111',
            fontFamily: 'var(--font-barlow), system-ui, sans-serif',
            margin: 0,
          }}
        >
          {message}
        </p>
        <div className="flex items-center justify-end gap-1">
          <span style={{ fontSize: 10.5, color: '#7D8A99' }}>{time}</span>
          {side === 'sent' && (
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path
                d="M1 5.5L5 9.5L11 1.5"
                stroke="#4FC3F7"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 5.5L9 9.5L15 1.5"
                stroke="#4FC3F7"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <div className="wpp-container rounded-3xl overflow-hidden" style={{ padding: '16px 12px' }}>
      {/* WPP header */}
      <div
        className="flex items-center gap-3 mb-3 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #009B3A, #007A2E)',
          }}
        >
          <span style={{ fontSize: 20 }}>⚽</span>
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-barlow), system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#111',
            }}
          >
            Figurinha Copa 2026
          </div>
          <div style={{ fontSize: 11.5, color: '#4caf50' }}>
            Online agora
          </div>
        </div>
      </div>

      {/* Messages */}
      {TESTIMONIALS.map((t, i) => (
        <WppBubble key={i} {...t} />
      ))}
    </div>
  )
}
