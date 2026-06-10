import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import * as path from 'path'
import * as fs from 'fs'

const FLUX_VERSION = '897a70f5a7dbd8a0611413b3b98cf417b45f266bd595c571a22947619d9ae462'

const JERSEY_PROMPT = `This image has TWO equal-sized panels side by side, separated by a thin white line.
LEFT PANEL: A reference photo showing exactly how the Brazil national team jersey looks.
RIGHT PANEL: The person to edit.

Your task: Edit ONLY the RIGHT PANEL. Apply the exact Brazil jersey from the LEFT PANEL to the person in the RIGHT PANEL.

Copy EXACTLY from the LEFT panel jersey:
- Yellow-gold fabric color and subtle texture
- Deep green V-neck collar (wide V, double-layer, same green on sleeve cuffs)
- Nike swoosh on the upper-LEFT area of chest (green, large, tilted)
- CBF crest CENTERED on the chest (horizontally centered, below the Nike swoosh):
  * 5 small stars in a row above the shield
  * Blue shield with a cross/lozenge pattern inside
  * "CBF" text inside the shield
  * "BRASIL" text below the shield in green
- The crest is in the CENTER of the chest, not to the side

Preserve EXACTLY from the RIGHT panel:
- The person's face, skin tone, eyes, hair — 100% unchanged
- Age and body proportions (keep child proportions if the person is a child)
- The person should be CENTERED horizontally in the frame

Output for RIGHT PANEL:
- Person wearing the Brazil jersey
- Clean white studio background
- Upright frontal pose, head straight, arms relaxed at sides
- Photorealistic 4K, professional sports portrait style`

const PANEL_W = 512

async function buildComposite(
  personBuffer: Buffer,
): Promise<{ composite: Buffer; personX: number; totalW: number }> {
  const refPath = path.join(process.cwd(), 'public/assets/jersey_ref.png')
  const refBuffer = fs.readFileSync(refPath)

  // Get person aspect ratio and determine panel height
  const personMeta = await sharp(personBuffer).metadata()
  const personOrigW = personMeta.width!
  const personOrigH = personMeta.height!
  const panelH = Math.round(personOrigH * (PANEL_W / personOrigW))

  // Resize person to PANEL_W x panelH
  const personResized = await sharp(personBuffer)
    .resize(PANEL_W, panelH)
    .jpeg({ quality: 92 })
    .toBuffer()

  // Resize+cover reference to SAME dimensions as person panel (equal size panels)
  const refResized = await sharp(refBuffer)
    .resize(PANEL_W, panelH, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toBuffer()

  const SEP = 8
  const totalW = PANEL_W + SEP + PANEL_W // 1032
  const personX = PANEL_W + SEP           // 520

  const composite = await sharp({
    create: { width: totalW, height: panelH, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: refResized, left: 0, top: 0 },
      { input: personResized, left: personX, top: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer()

  return { composite, personX, totalW }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })

    const personBuffer = Buffer.from(await photo.arrayBuffer())
    const { composite, personX, totalW } = await buildComposite(personBuffer)

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: FLUX_VERSION,
        input: {
          input_image: `data:image/jpeg;base64,${composite.toString('base64')}`,
          prompt: JERSEY_PROMPT,
          aspect_ratio: 'match_input_image',
          output_format: 'png',
          output_quality: 100,
          safety_tolerance: 3,
          prompt_upsampling: true,
        },
      }),
    })

    if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`)
    const prediction = await res.json()
    return NextResponse.json({ predictionId: prediction.id, personX, totalW })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
