import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/adminAuth'
import { siteConfig } from '@/lib/siteConfig'
import { Resend } from 'resend'

const BASE_URL      = siteConfig.baseUrl
const CHECKOUT_BASE = siteConfig.checkoutUrl

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key || key.startsWith('COLOQUE')) throw new Error('RESEND_API_KEY não configurada')
  return new Resend(key)
}

export async function POST(req: NextRequest) {
  const authErr = await checkAdminAuth(req)
  if (authErr) return authErr

  const { order_id } = await req.json() as { order_id?: string }
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data: order, error } = await sb
    .from('orders')
    .select('id, email, nome, download_token, paid, job_id')
    .eq('id', order_id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'pedido não encontrado' }, { status: 404 })
  if (order.paid)       return NextResponse.json({ error: 'pedido já pago' }, { status: 422 })
  if (!order.email)     return NextResponse.json({ error: 'sem email' }, { status: 422 })
  if (!order.job_id)    return NextResponse.json({ error: 'figurinha não gerada' }, { status: 422 })

  const primeiroNome  = (order.nome as string ?? 'Torcedor(a)').split(' ')[0]
  const previewUrl    = `${BASE_URL}/api/og/${order.download_token}`
  const checkoutUrl   = `${CHECKOUT_BASE}?job_id=${order.job_id}&utm_source=followup&utm_medium=email`

  await sb.from('orders').update({ followup_sent_at: new Date().toISOString() }).eq('id', order_id)

  await getResend().emails.send({
    from: siteConfig.emailFrom,
    to: order.email as string,
    subject: `⚽ ${primeiroNome}, sua figurinha da Copa 2026 está esperando você!`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#0f1f3d;border-radius:20px;overflow:hidden;border:1px solid rgba(255,213,0,0.15);">

        <!-- TOPO -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a3a7a,#0d1b4b);padding:32px;text-align:center;">
            <div style="font-size:52px;line-height:1;margin-bottom:10px;">⚽</div>
            <h1 style="margin:0;color:#FFD500;font-size:24px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
              Sua figurinha está esperando!
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">
              Copa do Mundo 2026
            </p>
          </td>
        </tr>

        <!-- CORPO -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:rgba(255,255,255,0.9);font-size:16px;line-height:1.6;">
              Olá, <strong style="color:#FFD500;">${primeiroNome}</strong>! 👋
            </p>
            <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;">
              Você gerou sua figurinha da Copa 2026 mas ainda não finalizou a compra.
              <strong style="color:#fff;">Ela está aqui, pronta</strong> — só falta garantir a versão sem marca d'água!
            </p>

            <!-- PREVIEW DA FIGURINHA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td align="center">
                  <div style="display:inline-block;">
                    <img src="${previewUrl}" alt="Prévia da sua figurinha" width="180"
                      style="border-radius:12px;display:block;border:3px solid rgba(255,213,0,0.3);" />
                    <div style="background:rgba(0,0,0,0.70);color:#FFD500;font-weight:900;font-size:11px;letter-spacing:2px;padding:6px 0;text-align:center;border-radius:0 0 10px 10px;">
                      🔒 PRÉVIA COM MARCA D'ÁGUA
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- EXPLICAÇÃO PÓS-PREVIEW -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,213,0,0.07);border:1px solid rgba(255,213,0,0.2);border-radius:14px;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 10px;color:#FFD500;font-size:14px;font-weight:900;text-align:center;letter-spacing:1px;">
                    ✅ Como receber a versão completa:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:13px;">
                        <span style="color:#FFD500;font-weight:700;">1.</span> Clique no botão abaixo e finalize o pagamento
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:13px;">
                        <span style="color:#FFD500;font-weight:700;">2.</span> Receba o link de download <strong style="color:#fff;">no seu email</strong> na hora
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:13px;">
                        <span style="color:#FFD500;font-weight:700;">3.</span> Baixe em <strong style="color:#fff;">4K sem marca d'água</strong> — pronta para imprimir e colar
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- URGÊNCIA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,100,0,0.1);border:1px solid rgba(255,100,0,0.25);border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:12px 18px;color:rgba(255,180,100,0.9);font-size:13px;font-weight:600;text-align:center;">
                  ⏰ Apenas <strong style="color:#FFD500;">R$ 12,90</strong> · Acesso imediato · Arquivo digital em alta resolução
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td align="center">
                  <a href="${checkoutUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,#FFD500,#ff9f00);color:#000;font-weight:900;font-size:15px;text-decoration:none;padding:18px 44px;border-radius:50px;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 8px 24px rgba(255,213,0,0.35);">
                    ⚽ QUERO MINHA FIGURINHA EM 4K
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;text-align:center;line-height:1.6;">
              Estilo Panini oficial · Sem marca d'água · Pronto para imprimir e colar no álbum
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
              © 2026 Convoca Kids · Você recebeu este email porque gerou uma figurinha em nosso site.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })

  return NextResponse.json({ sent: true })
}
