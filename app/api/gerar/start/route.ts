import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { storeImage } from '@/lib/imageCache'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Abordagem: manda o sticker como imagem principal e pede pra trocar a pessoa
// Muito mais preciso do que gerar tudo do zero
const SWAP_PROMPT = `
You have 3 images:
- IMAGE 1: A FIFA World Cup trading card sticker showing a man (Neymar). This is the BASE — keep everything except the person's identity.
- IMAGE 2: A child's photo. Use ONLY their face and identity.
- IMAGE 3: Brazil national team jersey close-up. Use ONLY for jersey details reference.

TASK: Replace the adult man in IMAGE 1 with the child from IMAGE 2.

WHAT TO KEEP FROM IMAGE 1 (do not change anything except the person):
- exact same pose and body position
- exact same jersey (use IMAGE 3 for details if needed)
- exact same teal/cyan background
- exact same framing and crop
- exact same camera angle and distance
- exact same lighting
- exact same composition

WHAT TO CHANGE:
- Replace ONLY the person's face and identity with the child from IMAGE 2
- Adjust body proportions to match a child's physique (smaller, younger build)
- Keep the child's exact face: skin tone, eyes, nose, mouth, hair, expression, age

JERSEY DETAILS (from IMAGE 3):
- canary yellow body
- dark green V-neck collar
- CBF crest centered on chest
- five gold stars above crest
- BRASIL text below crest
- Nike swoosh on left chest

CRITICAL:
- The child MUST be clearly recognizable as the same child from IMAGE 2
- Do NOT change the pose
- Do NOT change the background
- Do NOT change the jersey design
- Do NOT stylize or cartoonize
- Result must be photorealistic, 4K quality, sharp, HDR
`.trim()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBuffer = Buffer.from(await photo.arrayBuffer())
    const mimeType = (photo.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    // IMAGE 1: sticker do Neymar (imagem BASE — pose, jersey, fundo)
    const stickerPath = path.join(process.cwd(), 'public', 'assets', 'reference_sticker.png')
    const stickerFile = await toFile(fs.readFileSync(stickerPath), 'sticker.png', { type: 'image/png' })

    // IMAGE 2: foto da criança/pessoa (identidade)
    const personFile = await toFile(photoBuffer, 'person.png', { type: mimeType })

    // IMAGE 3: camiseta da seleção (referência de jersey)
    const jerseyPath = path.join(process.cwd(), 'public', 'assets', 'jersey_reference.png')
    const jerseyFile = await toFile(fs.readFileSync(jerseyPath), 'jersey.png', { type: 'image/png' })

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: [stickerFile, personFile, jerseyFile],
      prompt: SWAP_PROMPT,
      n: 1,
      size: '1024x1024',
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI não retornou imagem')

    const cacheId = storeImage(b64)
    const mockId = `mock_openai_${cacheId}`
    return NextResponse.json({ predictionId: mockId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[start/route] OpenAI error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
