import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const INSWAPPER_VERSION = '25bdae46f2713138640b6e8c04dc4ca18625ce95b1863936b053eee42d9ba6db'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const photoBase64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const mimeType = photo.type || 'image/jpeg'

    // Carrega a imagem base do corpo do craque (já gerado e limpo com gola verde e logo da Nike)
    const targetPath = path.join(process.cwd(), 'public/assets/jersey_body.png')
    const targetBase64 = fs.readFileSync(targetPath).toString('base64')

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: INSWAPPER_VERSION,
        input: {
          source_img: `data:${mimeType};base64,${photoBase64}`,
          target_img: `data:image/png;base64,${targetBase64}`,
          face_restore: true,
          face_upsample: true,
          background_enhance: true,
          upscale: 1,
          codeformer_fidelity: 0.7,
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
