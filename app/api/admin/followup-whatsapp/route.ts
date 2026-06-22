import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/adminAuth'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { siteConfig } from '@/lib/siteConfig'

export async function POST(req: NextRequest) {
  const authErr = await checkAdminAuth(req)
  if (authErr) return authErr

  const { order_id, phone } = await req.json() as { order_id?: string; phone?: string }
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data: order, error } = await sb
    .from('orders')
    .select('id, phone, nome, paid, job_id')
    .eq('id', order_id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'order not found' }, { status: 404 })
  if (order.paid) return NextResponse.json({ error: 'order already paid' }, { status: 422 })
  if (!order.job_id) return NextResponse.json({ error: 'no figurinha generated yet' }, { status: 422 })

  const targetPhone = phone || order.phone
  if (!targetPhone) return NextResponse.json({ error: 'phone number missing' }, { status: 422 })

  const host = req.headers.get('host') ?? 'copakids-ashen.vercel.app'
  const protocol = req.headers.get('x-forwarded-proto') ?? 'https'
  const dynamicBaseUrl = `${protocol}://${host}`

  const waName = order.nome ?? 'Torcedor(a)'
  const checkoutUrl = `${siteConfig.checkoutUrl}?job_id=${order.job_id}&utm_source=followup&utm_medium=whatsapp`
  const waMessage = `Olá, *${waName}*! ⚽\n\nSua figurinha personalizada da Copa 2026 está pronta!\n\nVocê pode finalizar o pagamento para liberar o download da figurinha em alta resolução sem marca d'água no link abaixo:\n👉 ${checkoutUrl}\n\nGaranta a sua para imprimir e colar! 🏆`

  const res = await sendWhatsAppMessage({
    phone: targetPhone,
    message: waMessage,
  })

  if (!res.success) {
    return NextResponse.json({ error: res.error ?? 'Falha ao enviar WhatsApp' }, { status: 500 })
  }

  // Atualiza telefone se veio diferente do cadastrado
  if (phone && phone !== order.phone) {
    await sb.from('orders').update({ phone }).eq('id', order_id)
  }

  // Registra que o follow-up foi enviado
  await sb.from('orders').update({ followup_sent_at: new Date().toISOString() }).eq('id', order_id)

  return NextResponse.json({ sent: true })
}
