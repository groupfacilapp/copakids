import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, OrderRow } from '@/lib/supabase'
import { sendDownloadEmail } from '@/lib/email'
import { saveLastWebhook } from '@/lib/webhookLog'
import { sendServerPurchase } from '@/lib/metaConversions'

interface WiapyCustomer {
  id?: string
  name?: string
  email?: string
  mobile_phone?: string
  document?: string
}

interface WiapyPayment {
  id?: string
  status?: string
  amount?: number
  payment_method?: string
  type?: string
}

interface WiapyCheckout {
  id?: string
  title?: string
  amount?: number
  orderbump?: Array<{ id: string; title: string }>
}

interface WiapyTracking {
  job_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  [key: string]: any
}

interface WiapyPayload {
  payment?: WiapyPayment
  customer?: WiapyCustomer
  checkout?: WiapyCheckout
  tracking?: WiapyTracking
}

function validateSecret(req: NextRequest): boolean {
  const secret = process.env.WIAPY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[wiapy/webhook] WIAPY_WEBHOOK_SECRET não configurado — qualquer request passa!')
    return true
  }

  // Verifica no header de autorização (Wiapy envia como Authorization: seu_token)
  const authHeader = req.headers.get('authorization') ?? ''
  
  // Limpa o prefixo 'Bearer ' se existir
  const cleanToken = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (cleanToken === secret || authHeader === secret) return true

  // Fallback: se o token vier como query parameter (?token=...)
  const queryToken = req.nextUrl.searchParams.get('token')
  if (queryToken === secret) return true

  return false
}

function extractOrderBumpProductIds(payload: WiapyPayload): string[] {
  const bumps = payload.checkout?.orderbump
  if (!bumps || !Array.isArray(bumps)) return []
  return bumps.map(b => b.id).filter(Boolean) as string[]
}

export async function POST(req: NextRequest) {
  let body: WiapyPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Salva payload para inspeção (TTL 1h) — útil para diagnósticos
  void saveLastWebhook(body)

  if (!validateSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orderId     = body.payment?.id ?? ''
  const orderStatus = body.payment?.status ?? ''
  const buyerEmail  = body.customer?.email ?? ''
  const buyerName   = body.customer?.name ?? ''
  const buyerPhone  = body.customer?.mobile_phone ?? ''

  console.log('[wiapy/webhook] event: payment_status status:', orderStatus, 'email:', buyerEmail)

  const isPaid = orderStatus === 'paid' || orderStatus === 'approved'

  if (!isPaid) {
    return NextResponse.json({ received: true, skipped: true })
  }

  if (!buyerEmail) {
    console.error('[wiapy/webhook] email do comprador ausente', JSON.stringify(body).slice(0, 500))
    return NextResponse.json({ error: 'buyer email missing' }, { status: 422 })
  }

  // Extrai job_id de várias possíveis fontes no payload da Wiapy ou query params
  const trackingJobId = 
    body.tracking?.job_id ?? 
    (body.checkout as any)?.tracking?.job_id ??
    (body.checkout as any)?.job_id ??
    (body.payment as any)?.tracking?.job_id ??
    (body as any)?.job_id ??
    req.nextUrl.searchParams.get('job_id') ?? 
    null

  const orderBumpProductIds = extractOrderBumpProductIds(body)
  const tracking = body.tracking ?? (body.checkout as any)?.tracking ?? null
  const utmParams = tracking

  const sb = getSupabaseAdmin()
  let order: Pick<OrderRow, 'id' | 'nome' | 'download_token' | 'paid'> | null = null

  // Matching primário: job_id exato (garante que comprador recebe SEMPRE sua figurinha correspondente)
  if (trackingJobId) {
    const { data, error } = await sb
      .from('orders')
      .select('id, nome, download_token, paid')
      .eq('job_id', trackingJobId)
      .eq('paid', false)
      .single()
    if (error && error.code !== 'PGRST116') {
      console.error('[wiapy/webhook] find by job_id error:', error)
    }
    order = data as Pick<OrderRow, 'id' | 'nome' | 'download_token' | 'paid'> | null
    if (order) console.log('[wiapy/webhook] matched by job_id:', trackingJobId)
  }

  // Fallback: email + mais recente não pago (compra sem job_id, ex: link direto ou clique rápido)
  if (!order) {
    const { data: rawOrders, error: findErr } = await sb
      .from('orders')
      .select('id, nome, download_token, paid')
      .eq('email', buyerEmail.toLowerCase().trim())
      .eq('paid', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (findErr) {
      console.error('[wiapy/webhook] find error:', findErr)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const list = rawOrders as Pick<OrderRow, 'id' | 'nome' | 'download_token' | 'paid'>[] | null
    order = list?.[0] ?? null
    if (order) console.log('[wiapy/webhook] matched by email fallback:', buyerEmail)
  }

  if (!order) {
    // Caso seja um webhook de order bump de um produto já pago
    const bumpProductIds = extractOrderBumpProductIds(body)
    if (bumpProductIds.length > 0) {
      const { data: paidList } = await sb
        .from('orders')
        .select('id, nome, download_token, order_bump_products')
        .eq('email', buyerEmail.toLowerCase().trim())
        .eq('paid', true)
        .order('paid_at', { ascending: false })
        .limit(1)

      const paidOrder = (paidList as (Pick<OrderRow, 'id' | 'nome' | 'download_token'> & { order_bump_products: string[] })[] | null)?.[0] ?? null
      if (paidOrder) {
        const existing: string[] = paidOrder.order_bump_products ?? []
        let updated = false
        const nextBumps = [...existing]
        for (const bid of bumpProductIds) {
          if (!nextBumps.includes(bid)) {
            nextBumps.push(bid)
            updated = true
          }
        }
        if (updated) {
          await sb.from('orders')
            .update({ order_bump_products: nextBumps } as Partial<OrderRow>)
            .eq('id', paidOrder.id)
          console.log('[wiapy/webhook] order bump adicionado:', bumpProductIds, '→ order', paidOrder.id)
          try {
            await sendDownloadEmail({
              to: buyerEmail,
              nome: paidOrder.nome ?? buyerName ?? 'Torcedor(a)',
              token: paidOrder.download_token,
              hasPdf: true,
            })
          } catch (emailErr) {
            console.error('[wiapy/webhook] email bump error:', emailErr)
          }
          return NextResponse.json({ received: true, order_bump_added: true, order_id: paidOrder.id })
        }
        return NextResponse.json({ received: true, order_bump_already_set: true })
      }
    }

    console.warn('[wiapy/webhook] pedido nao encontrado. email:', buyerEmail, 'job_id:', trackingJobId)
    return NextResponse.json({ received: true, order_not_found: true })
  }

  const { error: updateErr } = await sb
    .from('orders')
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      kiwify_order_id: orderId || null, // reusamos esta coluna do banco para o ID do checkout externo
      nome:  order.nome ?? buyerName ?? null,
      phone: buyerPhone || null,
      order_bump_products: orderBumpProductIds.length > 0 ? orderBumpProductIds : [],
      utm_params: utmParams,
    } as Partial<OrderRow>)
    .eq('id', order.id)

  if (updateErr) {
    console.error('[wiapy/webhook] update error:', updateErr)
    return NextResponse.json({ error: 'DB update error' }, { status: 500 })
  }

  try {
    await sendDownloadEmail({
      to: buyerEmail,
      nome: order.nome ?? buyerName ?? 'Torcedor(a)',
      token: order.download_token,
      hasPdf: orderBumpProductIds.length > 0,
    })
  } catch (emailErr) {
    console.error('[wiapy/webhook] email error:', emailErr)
  }

  // Meta Conversions API — Purchase server-side
  void sendServerPurchase({
    orderId:         orderId || order.id,
    email:           buyerEmail,
    name:            order.nome ?? buyerName ?? null,
    phone:           buyerPhone || null,
    value:           19.90,
    currency:        'BRL',
    clientIp:        req.headers.get('x-forwarded-for'),
    clientUserAgent: req.headers.get('user-agent'),
  })

  return NextResponse.json({ received: true, order_id: order.id })
}
