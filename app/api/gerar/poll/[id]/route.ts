import { NextRequest, NextResponse } from 'next/server'
import { retrieveImage } from '@/lib/imageCache'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Mock gerado pelo start/route.ts (OpenAI gpt-image-1)
    // O base64 fica em cache em memória; o ID é um hash curto de 32 chars
    if (id.startsWith('mock_openai_')) {
      const cacheId = id.replace('mock_openai_', '')
      const b64 = retrieveImage(cacheId)
      if (!b64) {
        return NextResponse.json({ error: 'Imagem expirada ou não encontrada no cache' }, { status: 404 })
      }
      const dataUrl = `data:image/png;base64,${b64}`
      return NextResponse.json({ status: 'succeeded', output: dataUrl, error: null })
    }

    // Mock legado: mock_vton_ (mantido por retrocompatibilidade)
    if (id.startsWith('mock_vton_')) {
      const base64Url = id.replace('mock_vton_', '')
      const decodedUrl = Buffer.from(base64Url, 'base64url').toString('utf8')
      return NextResponse.json({ status: 'succeeded', output: decodedUrl, error: null })
    }

    // Replicate polling (rembg e outros)
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_KEY!}` },
    })
    if (!res.ok) throw new Error(`Replicate ${res.status}`)
    const p = await res.json()
    // Normaliza output: arrays retornam primeiro elemento
    const raw = p.output ?? null
    const output = Array.isArray(raw) ? (raw[0] ?? null) : raw
    return NextResponse.json({ status: p.status, output, error: p.error ?? null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
