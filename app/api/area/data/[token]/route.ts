import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, OrderRow } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 32) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  let sb
  try {
    sb = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })
  }

  // Busca o pedido pelo token
  const { data: found, error: findErr } = await sb
    .from('orders')
    .select('id, paid, nome, dados_figurinha, created_at, download_token, sticker_path, email')
    .eq('download_token', token)
    .single()

  if (findErr || !found) {
    return NextResponse.json({ error: 'Token não encontrado' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thisOrder = found as any

  if (!thisOrder.paid) {
    return NextResponse.json({ pending: true })
  }

  // Busca todos os pedidos pagos do mesmo email
  let allOrders: unknown[] = [thisOrder]

  if (thisOrder.email) {
    const { data: allFound } = await sb
      .from('orders')
      .select('id, paid, nome, dados_figurinha, created_at, download_token, sticker_path, order_bump_products')
      .eq('email', thisOrder.email)
      .eq('paid', true)
      .order('created_at', { ascending: false })

    if (allFound && allFound.length > 0) allOrders = allFound
  }

  // Gera signed URLs para preview (600s de validade)
  const ordersWithPreviews = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (allOrders as any[]).map(async (o) => {
      let preview_url: string | null = null
      if (o.sticker_path) {
        try {
          const { data: signed } = await sb.storage
            .from('stickers')
            .createSignedUrl(o.sticker_path, 600)
          preview_url = signed?.signedUrl ?? null
        } catch { /* sem preview */ }
      }
      return {
        id:               o.id,
        nome:             o.nome ?? null,
        dados_figurinha:  o.dados_figurinha ?? null,
        created_at:       o.created_at,
        download_token:   o.download_token,
        preview_url,
      }
    })
  )

  // Verifica se algum pedido tem order bump com PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const has_pdf = (allOrders as any[]).some(o =>
    Array.isArray(o.order_bump_products) && o.order_bump_products.length > 0
  )

  const nome = thisOrder.nome ?? 'Torcedor(a)'

  return NextResponse.json(
    { nome, orders: ordersWithPreviews, has_pdf },
    {
      headers: {
        // Previews têm URLs de 600s, mas o JSON pode ficar em cache do browser
        'Cache-Control': 'no-store',
      },
    }
  )
}
