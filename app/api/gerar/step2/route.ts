import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { humanImageUrl } = await req.json()
    if (!humanImageUrl) return NextResponse.json({ error: 'humanImageUrl obrigatório' }, { status: 400 })

    // No Face Swap, a camiseta oficial já está aplicada no Passo 1.
    // Retornamos um mock ID com a URL encodada em base64url para o poll decodificar imediatamente.
    const mockId = `mock_vton_${Buffer.from(humanImageUrl).toString('base64url')}`
    return NextResponse.json({ predictionId: mockId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
