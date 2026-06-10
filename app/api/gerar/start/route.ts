import { NextRequest, NextResponse } from 'next/server'

const FLUX_VERSION = '897a70f5a7dbd8a0611413b3b98cf417b45f266bd595c571a22947619d9ae462'

const JERSEY_PROMPT = `Transform this into an official Brazil national football team Panini sticker card portrait. The person must be facing directly at the camera, body upright and centered, head straight, natural confident posture, arms relaxed along the sides of the body — exactly like an official squad photo. Dress them in the 2026 Brazil CBF home jersey: canary yellow fabric, green V-neck collar with thin yellow border, green cuff trim on sleeves, CBF crest badge centered on the chest with five gold five-pointed stars above it and the word BRASIL in green letters below the badge, Nike swoosh logo on the upper left chest area. The background must be a clean neutral dark or blurred studio background. Professional sports photography lighting, sharp and realistic. Keep the person's face, eyes, skin tone, hair, and all facial features IDENTICAL — do not alter the face at all. Portrait framing showing head and upper body down to mid-chest.`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBase64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const mimeType = photo.type || 'image/jpeg'

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: FLUX_VERSION,
        input: {
          input_image: `data:${mimeType};base64,${photoBase64}`,
          prompt: JERSEY_PROMPT,
          aspect_ratio: 'match_input_image',
          output_format: 'jpg',
          safety_tolerance: 3,
          prompt_upsampling: false,
        },
      }),
    })

    if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`)
    const prediction = await res.json()
    return NextResponse.json({ predictionId: prediction.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
