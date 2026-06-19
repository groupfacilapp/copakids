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
    .select('id, phone, nome, download_token, paid')
    .eq('id', order_id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'order not found' }, { status: 404 })
  if (!order.paid) return NextResponse.json({ error: 'order not paid' }, { status: 422 })

  const targetPhone = phone || order.phone
  if (!targetPhone) return NextResponse.json({ error: 'phone number missing' }, { status: 422 })

  const waName = order.nome ?? 'Torcedor(a)'
  const waLink = `${siteConfig.baseUrl}/area/${order.download_token}`
  const waMessage = `Olá, *${waName}*! 🎉\n\nSua figurinha personalizada da Copa 2026 está pronta!\n\nVocê pode visualizar e baixar a sua figurinha em alta resolução no link abaixo:\n👉 ${waLink}\n\nObrigado pela compra! ⚽🏆`

  const res = await sendWhatsAppMessage({
    phone: targetPhone,
    message: waMessage,
  })

  if (!res.success) {
    return NextResponse.json({ error: res.error ?? 'Falha ao enviar WhatsApp' }, { status: 500 })
  }

  // Se o telefone passado no corpo for diferente do cadastrado, atualiza no banco
  if (phone && phone !== order.phone) {
    await sb.from('orders').update({ phone }).eq('id', order_id)
  }

  return NextResponse.json({ sent: true })
}
