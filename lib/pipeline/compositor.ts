import sharp from 'sharp'
import { createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas'
import * as path from 'path'
import * as fs from 'fs'

const ASSETS = path.join(process.cwd(), 'public/assets')

function registerFonts() {
  const bold    = path.join(ASSETS, 'Barlow-Bold.ttf')
  const semi    = path.join(ASSETS, 'Barlow-SemiBold.ttf')
  const regular = path.join(ASSETS, 'Barlow-Regular.ttf')
  if (fs.existsSync(bold) && !GlobalFonts.has('Barlow')) {
    GlobalFonts.registerFromPath(bold,    'Barlow')
    GlobalFonts.registerFromPath(semi,    'BarlowSemi')
    GlobalFonts.registerFromPath(regular, 'BarlowRegular')
  }
}

// Layout — idêntico ao gerar_final.py
const W = 1016, H = 1350
const FOTO_X2 = 800, FOTO_Y2 = 1115
const FADE_START = Math.round(FOTO_Y2 * 0.78)

const PILL_X1  = 60,  PILL1_X2 = 760, PILL2_X2 = 703
const P1_Y1 = 1058, P1_Y2 = 1198
const P2_Y1 = 1215, P2_Y2 = 1308
const PILL_R = 26

// Badge CBF — posição calibrada para portrait frontal full upper body
const BADGE_CX = 390   // centro horizontal no espaço de 800px de foto
const BADGE_CY = 695   // ~62% do eixo Y da foto (1115px)
const BADGE_W  = 128   // largura do escudo

export interface UserData {
  nome: string
  data: string
  altura: string
  peso: string
  clube: string
  watermark?: boolean
}

function autoFit(ctx: SKRSContext2D, text: string, targetSize: number, fontFamily: string, maxW: number): number {
  for (let s = targetSize; s >= 12; s--) {
    ctx.font = `${s}px "${fontFamily}"`
    if (ctx.measureText(text).width <= maxW) return s
  }
  return 12
}

function drawStar(ctx: SKRSContext2D, cx: number, cy: number, r: number) {
  const inner = r * 0.38
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : inner
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const px = cx + radius * Math.cos(angle)
    const py = cy + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function drawCBFBadge(ctx: SKRSContext2D, cx: number, cy: number, w: number) {
  const h  = Math.round(w * 1.18)
  const bx = cx - w / 2
  const by = cy - h / 2
  const r  = w * 0.11

  // ── 5 estrelas acima do escudo ──────────────────────────────────────────
  const starR   = w * 0.072
  const starGap = w * 0.158
  const starY   = by - starR * 1.5
  ctx.fillStyle = '#119C4A'
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, cx - 2 * starGap + i * starGap, starY, starR)
  }

  // ── Escudo azul (forma herálica: topo reto, base em V) ──────────────────
  ctx.beginPath()
  ctx.moveTo(bx + r, by)
  ctx.lineTo(bx + w - r, by)
  ctx.arcTo(bx + w, by,       bx + w, by + r,       r)
  ctx.lineTo(bx + w, by + h * 0.62)
  ctx.bezierCurveTo(bx + w, by + h * 0.87, cx + w * 0.18, by + h, cx, by + h)
  ctx.bezierCurveTo(cx - w * 0.18, by + h, bx, by + h * 0.87, bx, by + h * 0.62)
  ctx.lineTo(bx, by + r)
  ctx.arcTo(bx, by,           bx + r, by,           r)
  ctx.closePath()
  ctx.fillStyle = '#0058A8'
  ctx.fill()

  // Borda branca fina
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = w * 0.022
  ctx.stroke()

  // ── Losango branco interno ───────────────────────────────────────────────
  const dCX = cx
  const dCY = by + h * 0.40
  const dW  = w * 0.64
  const dH  = h * 0.48

  ctx.beginPath()
  ctx.moveTo(dCX,          dCY - dH / 2)
  ctx.lineTo(dCX + dW / 2, dCY)
  ctx.lineTo(dCX,          dCY + dH / 2)
  ctx.lineTo(dCX - dW / 2, dCY)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // Cruz verde no losango
  const lw = w * 0.038
  ctx.strokeStyle = '#119C4A'
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(dCX, dCY - dH / 2 + lw)
  ctx.lineTo(dCX, dCY + dH / 2 - lw)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(dCX - dW / 2 + lw, dCY)
  ctx.lineTo(dCX + dW / 2 - lw, dCY)
  ctx.stroke()

  // ── Texto "CBF" ─────────────────────────────────────────────────────────
  ctx.font = `bold ${Math.round(w * 0.19)}px "Barlow"`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CBF', dCX, dCY)

  // ── Texto "BRASIL" ───────────────────────────────────────────────────────
  ctx.font = `bold ${Math.round(w * 0.15)}px "Barlow"`
  ctx.fillStyle    = '#119C4A'
  ctx.textBaseline = 'top'
  ctx.fillText('BRASIL', cx, by + h * 0.77)
}

export async function compositeSticker(personPng: Buffer, data: UserData): Promise<Buffer> {
  registerFonts()

  // ── 1. Redimensionar e fadear foto via sharp ──────────────────────────────
  const meta = await sharp(personPng).metadata()
  const pw = meta.width!, ph = meta.height!

  const rSrc = pw / ph, rDst = FOTO_X2 / FOTO_Y2
  let newW: number, newH: number
  if (rSrc > rDst) { newH = FOTO_Y2; newW = Math.round(newH * rSrc) }
  else              { newW = FOTO_X2; newH = Math.round(newW / rSrc) }

  const cx = Math.round((newW - FOTO_X2) / 2)

  const fotoResized = await sharp(personPng)
    .resize(newW, newH)
    .extract({ left: cx, top: 0, width: FOTO_X2, height: FOTO_Y2 })
    .png()
    .toBuffer()

  // Máscara de fade vertical
  const fadeMap: number[] = []
  for (let y = 0; y < FOTO_Y2; y++) {
    for (let x = 0; x < FOTO_X2; x++) {
      if (y < FADE_START) {
        fadeMap.push(255, 255, 255, 255)
      } else {
        const t = (y - FADE_START) / (FOTO_Y2 - FADE_START)
        const alpha = Math.round(255 * (1 - t * 0.97))
        fadeMap.push(255, 255, 255, alpha)
      }
    }
  }
  const fadeMask = await sharp(Buffer.from(fadeMap), {
    raw: { width: FOTO_X2, height: FOTO_Y2, channels: 4 },
  }).png().toBuffer()

  const fotoFaded = await sharp(fotoResized)
    .composite([{ input: fadeMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  // ── 2. Compositar foto sobre o template ──────────────────────────────────
  const composited = await sharp(path.join(ASSETS, 'template.png'))
    .composite([{ input: fotoFaded, top: 0, left: 0 }])
    .png()
    .toBuffer()

  // ── 3. Canvas: escudo CBF + pills + texto ─────────────────────────────────
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Escudo CBF sobre o peito
  drawCBFBadge(ctx, BADGE_CX, BADGE_CY, BADGE_W)

  // Pills
  function pill(x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath()
    ctx.roundRect(x1, y1, x2 - x1, y2 - y1, PILL_R)
    ctx.fillStyle = 'rgba(6,121,134,0.98)'
    ctx.fill()
  }
  pill(PILL_X1, P1_Y1, PILL1_X2, P1_Y2)
  pill(PILL_X1, P2_Y1, PILL2_X2, P2_Y2)

  // Texto pill 1 — nome + stats
  const p1h = P1_Y2 - P1_Y1
  const p1cx = (PILL_X1 + PILL1_X2) / 2
  const p1cw = PILL1_X2 - PILL_X1 - 48

  const nomeUpper     = data.nome.toUpperCase()
  const [dd, mm, yy]  = data.data.split('/')
  const dataFormatada = `${parseInt(dd)}-${parseInt(mm)}-${yy}`
  const statsText     = `${dataFormatada} | ${data.altura} | ${data.peso}`

  const NAME_TARGET = Math.round(p1h * 0.33 / 0.72)
  const nameSize    = autoFit(ctx, nomeUpper, NAME_TARGET, 'Barlow', p1cw)
  const statSize    = autoFit(ctx, statsText, Math.round(nameSize / 1.577), 'BarlowRegular', p1cw)

  ctx.font = `${nameSize}px "Barlow"`
  const nm = ctx.measureText(nomeUpper)
  const nameH = nm.actualBoundingBoxAscent + nm.actualBoundingBoxDescent

  ctx.font = `${statSize}px "BarlowRegular"`
  const sm = ctx.measureText(statsText)
  const statH = sm.actualBoundingBoxAscent + sm.actualBoundingBoxDescent

  const GAP    = Math.round(p1h * 0.04)
  const blockH = nameH + GAP + statH
  const baseY  = P1_Y1 + (p1h - blockH) / 2 + nameH

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.font      = `${nameSize}px "Barlow"`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(nomeUpper, p1cx, baseY)

  ctx.font      = `${statSize}px "BarlowRegular"`
  ctx.fillStyle = 'rgba(255,255,255,0.90)'
  ctx.fillText(statsText, p1cx, baseY + GAP + statH)

  // Texto pill 2 — clube
  const p2h  = P2_Y2 - P2_Y1
  const p2cx = (PILL_X1 + PILL2_X2) / 2
  const p2cw = PILL2_X2 - PILL_X1 - 48

  const clubeUpper  = data.clube.toUpperCase()
  const CLUB_TARGET = Math.round(nameSize * (27 / 45.9))
  const clubSize    = autoFit(ctx, clubeUpper, CLUB_TARGET, 'Barlow', p2cw)

  ctx.font = `${clubSize}px "Barlow"`
  const cm = ctx.measureText(clubeUpper)
  const clubH = cm.actualBoundingBoxAscent + cm.actualBoundingBoxDescent
  const clubY = P2_Y1 + (p2h - clubH) / 2 + clubH + 6

  ctx.fillStyle = '#ffffff'
  ctx.fillText(clubeUpper, p2cx, clubY)

  // Watermark
  if (data.watermark) {
    ctx.save()
    ctx.globalAlpha = 0.22
    ctx.fillStyle   = '#ffffff'
    ctx.font        = 'bold 52px "Barlow"'
    ctx.textAlign   = 'center'
    ctx.translate(W / 2, H / 2)
    ctx.rotate(-Math.PI / 5)
    for (let y = -600; y < 600; y += 130) {
      ctx.fillText('PRÉVIA  •  PRÉVIA  •  PRÉVIA', 0, y)
    }
    ctx.restore()
  }

  const overlayPng = canvas.toBuffer('image/png')

  // ── 4. Compositar overlay sobre a imagem ─────────────────────────────────
  const finalBuffer = await sharp(composited)
    .composite([{ input: overlayPng }])
    .png()
    .toBuffer()

  return finalBuffer
}
