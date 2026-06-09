'use client'

import React from 'react'
import clsx from 'clsx'

interface FigurinhaCardProps {
  name?: string
  photo?: string | null
  birthDate?: string
  height?: string
  weight?: string
  club?: string
  number?: number
  showWatermark?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  tilt?: 'left' | 'right' | 'none'
}

/* ── Panini Copa 2026 proportions (63×85mm base) ── */
const SIZES = {
  xs: { w: 108, h: 148, r: 7,  decoF: 68,  nameF: 8,   statsF: 5.5, pillH: 20, clubH: 16, flagR: 18, numR: 18, stripW: 0.22 },
  sm: { w: 148, h: 202, r: 9,  decoF: 95,  nameF: 11,  statsF: 7,   pillH: 28, clubH: 22, flagR: 24, numR: 24, stripW: 0.22 },
  md: { w: 204, h: 278, r: 12, decoF: 130, nameF: 14.5,statsF: 8.5, pillH: 38, clubH: 30, flagR: 32, numR: 30, stripW: 0.22 },
  lg: { w: 262, h: 357, r: 15, decoF: 168, nameF: 18,  statsF: 10.5,pillH: 48, clubH: 38, flagR: 40, numR: 38, stripW: 0.22 },
}

/* ── Brazil flag ── */
function BrazilFlag({ r }: { r: number }) {
  return (
    <svg width={r} height={r} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#009C3B" />
      <polygon points="20,3.5 37,20 20,36.5 3,20" fill="#FFDF00" />
      <circle cx="20" cy="20" r="12" fill="#002776" />
      <path d="M8,20 Q20,15.5 32,20" stroke="white" strokeWidth="2.2" fill="none" />
    </svg>
  )
}

/* ── FIFA 2026 badge ── */
function FifaBadge({ r, nameF }: { r: number; nameF: number }) {
  return (
    <div
      style={{
        width: r,
        height: r,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#1A3256,#243A70)',
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'Arial,sans-serif',
          fontSize: nameF * 0.54,
          fontWeight: 900,
          color: 'white',
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        FIFA
      </span>
      <span
        style={{
          fontFamily: 'Arial,sans-serif',
          fontSize: nameF * 0.7,
          fontWeight: 900,
          color: '#FFD500',
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        26
      </span>
    </div>
  )
}

/* ── Player silhouette (placeholder) ── */
function PlayerSilhouette({ number }: { number: number }) {
  return (
    <svg viewBox="0 0 100 140" style={{ width: '74%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="136" rx="30" ry="4.5" fill="rgba(20,80,130,0.25)" />
      {/* Legs */}
      <rect x="35" y="104" width="13" height="32" rx="5" fill="#1A3A60" />
      <rect x="52" y="104" width="13" height="32" rx="5" fill="#1A3A60" />
      {/* Shorts */}
      <rect x="31" y="94" width="38" height="18" rx="6" fill="#0D1B4B" />
      {/* Jersey */}
      <path d="M26 62 Q26 50 40 44 Q48 40 50 40 Q52 40 60 44 Q74 50 74 62 L74 98 L26 98 Z" fill="#009B3A" />
      {/* Jersey detail */}
      <path d="M26 62 Q26 50 40 44 Q47 41 50 40 L50 98 L26 98 Z" fill="rgba(255,255,255,0.07)" />
      {/* Number on jersey */}
      <text x="50" y="78" textAnchor="middle" fill="rgba(255,213,0,0.9)" fontSize="18" fontWeight="bold" fontFamily="Impact,Arial">
        {number}
      </text>
      {/* Arms */}
      <rect x="12" y="56" width="16" height="9" rx="4.5" fill="#009B3A" transform="rotate(28,20,60)" />
      <rect x="72" y="56" width="16" height="9" rx="4.5" fill="#009B3A" transform="rotate(-28,80,60)" />
      {/* Neck */}
      <rect x="44" y="30" width="12" height="14" rx="5" fill="#C8845E" />
      {/* Head */}
      <ellipse cx="50" cy="22" rx="18" ry="20" fill="#C8845E" />
      {/* Hair */}
      <ellipse cx="50" cy="8" rx="19" ry="11" fill="#1a0f00" />
      <ellipse cx="31.5" cy="18" rx="5" ry="9" fill="#1a0f00" />
      <ellipse cx="68.5" cy="18" rx="5" ry="9" fill="#1a0f00" />
      {/* Eyes */}
      <circle cx="43" cy="22" r="3" fill="white" />
      <circle cx="57" cy="22" r="3" fill="white" />
      <circle cx="44" cy="23" r="1.8" fill="#1a0f00" />
      <circle cx="58" cy="23" r="1.8" fill="#1a0f00" />
      {/* Smile */}
      <path d="M43,31 Q50,37 57,31" stroke="#1a0f00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function FigurinhaCard({
  name = 'CRAQUE',
  photo,
  birthDate,
  height,
  weight,
  club = '',
  number = 10,
  showWatermark = false,
  size = 'md',
  className,
  tilt = 'none',
}: FigurinhaCardProps) {
  const s = SIZES[size]
  const displayName = (name || 'CRAQUE').toUpperCase()
  const stripW = Math.round(s.w * s.stripW)
  const photoW = s.w - stripW
  const topH = s.h - s.pillH - s.clubH - 4 // 4 = gap between pills

  const tiltClass =
    tilt === 'left' ? 'rotate-[-6deg]' : tilt === 'right' ? 'rotate-[6deg]' : ''

  return (
    <div
      className={clsx('relative flex-shrink-0', tiltClass, className)}
      style={{
        width: s.w,
        height: s.h,
        /* Thin light border mirroring official sticker */
        borderRadius: s.r + 2,
        padding: 2,
        background: 'linear-gradient(145deg,rgba(255,255,255,0.7),rgba(150,200,235,0.6),rgba(255,255,255,0.5))',
        boxShadow: '0 20px 60px rgba(0,0,0,0.42), 0 4px 16px rgba(0,0,0,0.18)',
      }}
    >
      {/* Card inner */}
      <div
        className="relative w-full h-full overflow-hidden flex flex-col"
        style={{ borderRadius: s.r, background: '#5CB8E8' /* Copa 2026 signature blue */ }}
      >

        {/* ═══ TOP SECTION (photo + right strip) ═══ */}
        <div className="relative flex" style={{ height: topH, flexShrink: 0 }}>

          {/* Decorative "26" — visible behind photo */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              bottom: 0,
              left: -s.decoF * 0.06,
              fontFamily: 'var(--font-bebas),Impact,cursive',
              fontSize: s.decoF,
              color: 'rgba(25,115,172,0.38)',
              lineHeight: 1,
              letterSpacing: -3,
              zIndex: 0,
            }}
          >
            26
          </div>

          {/* Photo area */}
          <div
            style={{
              width: photoW,
              height: '100%',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={displayName}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 4,
                }}
              >
                <PlayerSilhouette number={number} />
              </div>
            )}
            {/* Bottom photo gradient */}
            <div
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '28%',
                background: 'linear-gradient(to top, rgba(20,60,100,0.35), transparent)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Right strip */}
          <div
            style={{
              width: stripW,
              height: '100%',
              background: 'rgba(18,80,130,0.22)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: size === 'xs' ? 5 : 8,
              paddingBottom: size === 'xs' ? 5 : 10,
              zIndex: 2,
              flexShrink: 0,
            }}
          >
            {/* FIFA badge */}
            <FifaBadge r={Math.round(stripW * 0.78)} nameF={s.nameF} />

            {/* Brazil flag */}
            <div
              style={{
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.45)',
                flexShrink: 0,
              }}
            >
              <BrazilFlag r={s.flagR} />
            </div>

            {/* BRA + dots */}
            {size !== 'xs' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Arial,sans-serif',
                    fontSize: size === 'sm' ? 7 : 9.5,
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.9)',
                    letterSpacing: 1.5,
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  BRA
                </span>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: Math.round(stripW * 0.5),
                      height: 2,
                      borderRadius: 99,
                      background: 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Player number badge */}
            <div
              style={{
                width: s.numR,
                height: s.numR,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#FFD700,#E6A000)',
                color: '#0D1B4B',
                fontFamily: 'var(--font-bebas),Impact,cursive',
                fontSize: Math.round(s.numR * 0.56),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}
            >
              {number}
            </div>
          </div>
        </div>

        {/* ═══ NAME PILL ═══ */}
        <div
          style={{
            height: s.pillH,
            background: 'linear-gradient(135deg,#1A3A58,#1E4472)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `0 ${Math.max(s.r, 8)}px`,
            marginTop: 2,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-bebas),Impact,cursive',
              fontSize: s.nameF,
              color: 'white',
              letterSpacing: 0.3,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </div>
          {size !== 'xs' && (birthDate || height || weight) && (
            <div
              style={{
                fontSize: s.statsF,
                color: 'rgba(255,255,255,0.78)',
                fontFamily: 'Arial,sans-serif',
                fontWeight: 600,
                lineHeight: 1.2,
                display: 'flex',
                gap: 4,
                marginTop: 1.5,
                flexWrap: 'wrap',
              }}
            >
              {birthDate && <span>{birthDate}</span>}
              {birthDate && (height || weight) && <span style={{ opacity: 0.4 }}>|</span>}
              {height && <span>{height} m</span>}
              {height && weight && <span style={{ opacity: 0.4 }}>|</span>}
              {weight && <span>{weight} kg</span>}
            </div>
          )}
        </div>

        {/* ═══ CLUB PILL ═══ */}
        <div
          style={{
            height: s.clubH,
            background: 'linear-gradient(135deg,#245A90,#2A6AAA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${Math.max(s.r, 8)}px`,
            marginTop: 2,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-bebas),Impact,cursive',
              fontSize: s.nameF * 0.86,
              color: 'white',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {size !== 'xs' ? (club || 'CLUBE').toUpperCase() : ''}
          </div>
          {size !== 'xs' && (
            <span
              style={{
                fontFamily: 'Arial,sans-serif',
                fontSize: s.statsF * 0.9,
                fontWeight: 900,
                color: '#FFD500',
                letterSpacing: -0.3,
                flexShrink: 0,
                marginLeft: 4,
              }}
            >
              PANINI
            </span>
          )}
        </div>

        {/* ═══ WATERMARK ═══ */}
        {showWatermark && (
          <div className="watermark-overlay">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id={`wm-${size}`}
                  x="0" y="0" width="86" height="43"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(-38)"
                >
                  <text
                    x="0" y="27"
                    fontSize={s.statsF * 1.05}
                    fill="rgba(255,255,255,0.38)"
                    fontWeight="bold"
                    fontFamily="Arial,sans-serif"
                    letterSpacing="2"
                  >
                    PREVIEW
                  </text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#wm-${size})`} />
            </svg>
          </div>
        )}

        {/* Subtle inner border / shine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: s.r,
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        />
      </div>
    </div>
  )
}
