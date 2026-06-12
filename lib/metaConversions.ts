import crypto from 'crypto'
import { PIXEL_ID } from '@/lib/pixel'

const API_VERSION = 'v19.0'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

interface PurchaseEventParams {
  orderId: string
  email: string
  name?: string | null
  phone?: string | null
  value: number
  currency: string
  clientIp?: string | null
  clientUserAgent?: string | null
}

export async function sendServerPurchase(params: PurchaseEventParams): Promise<void> {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) return  // sem token configurado, silencia

  const userData: Record<string, string> = {
    em: sha256(params.email),
  }
  if (params.name) {
    const parts = params.name.trim().split(/\s+/)
    userData.fn = sha256(parts[0])
    if (parts.length > 1) userData.ln = sha256(parts[parts.length - 1])
  }
  if (params.phone) {
    userData.ph = sha256(params.phone.replace(/\D/g, ''))
  }
  if (params.clientIp)        userData.client_ip_address  = params.clientIp
  if (params.clientUserAgent) userData.client_user_agent  = params.clientUserAgent

  const body: Record<string, unknown> = {
    data: [{
      event_name:        'Purchase',
      event_time:        Math.floor(Date.now() / 1000),
      event_source_url:  'https://www.convocakids.com/sua-figurinha',
      action_source:     'website',
      custom_data: {
        value:    params.value,
        currency: params.currency,
        order_id: params.orderId,
      },
      user_data: userData,
    }],
  }

  // Test event code opcional (ativo só se a env var existir)
  const testCode = process.env.META_TEST_EVENT_CODE
  if (testCode) body.test_event_code = testCode

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('[meta-capi] error', res.status, await res.text())
    }
  } catch (err) {
    console.error('[meta-capi] fetch failed:', err)
  }
}
