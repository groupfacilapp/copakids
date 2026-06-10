import { NextRequest, NextResponse } from 'next/server'

const FLUX_VERSION = '897a70f5a7dbd8a0611413b3b98cf417b45f266bd595c571a22947619d9ae462'

const JERSEY_PROMPT = `Full upper body portrait, front-facing pose, person looking directly at the camera, wearing a plain solid yellow jersey with green V-neck collar and green sleeve cuffs, NO logos, NO badges, NO text on the jersey — just plain yellow fabric. Arms relaxed and straight at the sides (NOT crossed, NOT folded).

FACE — CRITICAL: preserve the face 100% identical to the input photo. Do NOT add beard, stubble, mustache, wrinkles, or ANY facial hair that does not exist in the original photo. If the person is a child, keep the child face exactly as-is. Do not age the person. Do not alter skin, hair, eyes, or expression.

Studio photography, clean white background, soft professional studio lighting, sharp focus, photorealistic, ultra high resolution, 4K.`

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
          input_image:       `data:${mimeType};base64,${photoBase64}`,
          prompt:            JERSEY_PROMPT,
          aspect_ratio:      'match_input_image',
          output_format:     'png',
          output_quality:    100,
          safety_tolerance:  3,
          prompt_upsampling: true,
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
