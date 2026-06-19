import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/adminAuth'
import { sendDownloadEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authErr = await checkAdminAuth(req)
  if (authErr) return authErr

  const { order_id } = await req.json() as { order_id?: string }
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data: order, error } = await sb
    .from('orders')
    .select('id, email, nome, download_token, paid, order_bump_products')
    .eq('id', order_id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'order not found' }, { status: 404 })
  if (!order.paid) return NextResponse.json({ error: 'order not paid' }, { status: 422 })
  if (!order.email) return NextResponse.json({ error: 'email missing' }, { status: 422 })

  const host = req.headers.get('host') ?? 'copakids-ashen.vercel.app'
  const protocol = req.headers.get('x-forwarded-proto') ?? 'https'
  const dynamicBaseUrl = `${protocol}://${host}`

  await sendDownloadEmail({
    to: order.email,
    nome: order.nome ?? 'Torcedor(a)',
    token: order.download_token,
    hasPdf: (order.order_bump_products ?? []).length > 0,
    baseUrl: dynamicBaseUrl,
  })

  return NextResponse.json({ sent: true })
}
