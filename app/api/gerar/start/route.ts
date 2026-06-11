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
- IMAGE 1: photo of a person — use ONLY for their face/identity
- IMAGE 2: Neymar in a yellow jersey — use ONLY for pose, framing, background

TASK: Output a photo of the person from IMAGE 1, in the same pose and framing as IMAGE 2.

FACE — copy exactly from IMAGE 1, change nothing:
- Same facial structure, eyes, nose, mouth, skin tone, hair, age
- Do not retouch, relight or alter the face in any way

JERSEY:
- Plain canary yellow fabric, dark green V-neck collar, dark green sleeve cuffs
- IMPORTANT: Do NOT put any logos, badges, crests, emblems or text on the jersey
- The jersey chest must be plain yellow with absolutely no markings
- Logos will be added in post-processing — leave the chest area clean

FRAMING — copy from IMAGE 2:
- Upper body portrait: full head + chest + upper stomach visible
- Head in the top third of the frame
- Same camera distance as IMAGE 2 — do not zoom into the face

BACKGROUND: solid dark gray, no text, no graphics

OUTPUT: photorealistic, sharp, professional sports portrait photo
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
