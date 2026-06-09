// FLUX Kontext Pro (Replicate) — edita roupa mantendo rosto/identidade idênticos
// Usa a mesma REPLICATE_API_KEY já configurada para o rembg

const FLUX_VERSION = '897a70f5a7dbd8a0611413b3b98cf417b45f266bd595c571a22947619d9ae462'

const JERSEY_PROMPT = `Change only the clothing to the official Brazil national football team home jersey: bright yellow shirt, green V-neck collar, green sleeve cuffs, CBF badge centered on chest with five gold stars above it, green BRASIL text below the badge. Keep the person's face, hair, skin tone, expression, and all physical features 100% identical. Studio lighting, neutral dark background, photorealistic.`

export async function generateJerseyPhoto(photoBase64: string, mimeType: string): Promise<Buffer> {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
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

  if (!res.ok) throw new Error(`FLUX Kontext HTTP ${res.status}: ${await res.text()}`)

  let prediction = await res.json() as {
    status: string
    output: string | null
    error: string | null
    urls: { get: string }
  }

  // Polling de fallback se não terminar dentro dos 60s
  let attempts = 0
  while ((prediction.status === 'starting' || prediction.status === 'processing') && attempts < 40) {
    await new Promise((r) => setTimeout(r, 3000))
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}` },
    })
    prediction = await poll.json()
    attempts++
  }

  if (prediction.status === 'failed' || !prediction.output) {
    throw new Error(`FLUX Kontext falhou: ${prediction.error ?? 'sem output'}`)
  }

  const imgRes = await fetch(prediction.output)
  if (!imgRes.ok) throw new Error('Falha ao baixar imagem do FLUX Kontext')
  return Buffer.from(await imgRes.arrayBuffer())
}
