import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { storeImage } from '@/lib/imageCache'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// IMAGE 1: foto da pessoa (identidade)
// IMAGE 2: camiseta_exemplo.png — Neymar com a camiseta da seleção (pose + jersey)
// Resultado: retrato limpo da pessoa com a camiseta e pose do IMAGE 2
// O card/figurinha é montado depois pelo compositeSticker
const SWAP_PROMPT = `
You have 2 images:
- IMAGE 1: A photo of a person. Use ONLY for identity.
- IMAGE 2: Neymar in Brazil national team jersey. Use ONLY for pose, framing, jersey and background.

TASK: Recreate IMAGE 2 but replace Neymar with the person from IMAGE 1. Everything else stays identical.

─── IDENTITY — ABSOLUTE PRIORITY ───
The person from IMAGE 1 must be 100% recognizable in the output.
DO NOT change ANYTHING about their face:
- facial structure, proportions, eyes, nose, mouth, ears
- skin tone, hair color, hairstyle, age, expression
If the face looks different from IMAGE 1 in ANY way, the output is WRONG.

─── FRAMING — match IMAGE 2 exactly ───
- Same zoom level as IMAGE 2: full upper body visible from chest to top of head
- Head takes up approximately the TOP THIRD of the image
- Jersey and chest are clearly visible in the lower two thirds
- Do NOT zoom in — if in doubt, zoom out to match IMAGE 2

─── JERSEY — match IMAGE 2 exactly ───
- Canary yellow body, dark green V-neck collar, dark green sleeve cuffs
- Nike swoosh on upper-left chest area
- CBF badge on the chest (position same as IMAGE 2)
- Same fabric texture as IMAGE 2

─── BACKGROUND ───
- Same dark gray background as IMAGE 2
- No text, no graphics, no card frame, no watermark

─── OUTPUT ───
- Photorealistic, sharp, professional sports portrait
`.trim()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBuffer = Buffer.from(await photo.arrayBuffer())
    const mimeType = (photo.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    // IMAGE 1: foto da pessoa
    const personFile = await toFile(photoBuffer, 'person.png', { type: mimeType })

    // IMAGE 2: Neymar com camiseta — referência de pose e jersey
    const jerseyPath = path.join(process.cwd(), 'public', 'assets', 'jersey_reference.png')
    const jerseyFile = await toFile(fs.readFileSync(jerseyPath), 'jersey.png', { type: 'image/png' })

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: [personFile, jerseyFile],
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
