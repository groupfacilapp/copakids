import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { storeImage } from '@/lib/imageCache'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Prompt focado em colocar a camiseta da Seleção Brasileira de forma limpa
const JERSEY_PROMPT = [
  'The person in the photo is now wearing the official Brazil national soccer team jersey.',
  'The jersey is bright yellow with a V-shaped green collar.',
  'The official CBF (Confederação Brasileira de Futebol) badge is on the left chest.',
  'A small Nike logo is on the right chest.',
  'The word BRASIL appears at the bottom of the jersey.',
  'Four yellow stars are above the CBF badge.',
  'Keep the face, skin tone, hair and expression exactly as in the original photo.',
  'The person should be facing forward with a natural pose, upper body visible.',
  'Photorealistic, high quality, studio lighting with a clean white or neutral background.',
].join(' ')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBuffer = Buffer.from(await photo.arrayBuffer())
    const mimeType = (photo.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    // Converte para File object que o OpenAI SDK aceita
    const imageFile = await toFile(photoBuffer, 'photo.png', { type: mimeType })

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt: JERSEY_PROMPT,
      n: 1,
      size: '1024x1024',
    })

    // gpt-image-1 retorna base64 diretamente
    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI não retornou imagem')

    // Armazena em cache e retorna ID curto (evita URL gigante no poll)
    const cacheId = storeImage(b64)
    const mockId = `mock_openai_${cacheId}`
    return NextResponse.json({ predictionId: mockId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[start/route] OpenAI error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
