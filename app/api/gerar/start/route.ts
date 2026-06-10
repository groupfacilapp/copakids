import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// lucataco/faceswap — troca só o rosto, preserva corpo + camiseta da referência
const FACESWAP_VERSION = '25bdae46f2713138640b6e8c04dc4ca18625ce95b1863936b053eee42d9ba6db'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBase64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const mimeType = photo.type || 'image/jpeg'

    // Target fixo: camiseta_exemplo.png — pose frontal padrão + jersey oficial com Nike, CBF badge e BRASIL
    const targetPath = path.join(process.cwd(), 'public/assets/camiseta_exemplo.png')
    const targetBase64 = fs.readFileSync(targetPath).toString('base64')

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: FACESWAP_VERSION,
        input: {
          source_img:          `data:${mimeType};base64,${photoBase64}`,
          target_img:          `data:image/png;base64,${targetBase64}`,
          face_restore:        true,
          face_upsample:       true,
          background_enhance:  false,
          upscale:             1,
          codeformer_fidelity: 0.8,
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
