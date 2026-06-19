export function formatPhoneForWhatsApp(phone: string): string {
  // Remove tudo que não for número
  let cleaned = phone.replace(/\D/g, '')

  // Se o número estiver vazio, retorna
  if (!cleaned) return ''

  // Se o número tiver 10 ou 11 dígitos (DDD + Número), adiciona o DDI 55 (Brasil)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned
  }

  return cleaned
}

interface SendMessageOptions {
  phone: string
  message: string
}

export async function sendWhatsAppMessage({ phone, message }: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
  const provider = process.env.WHATSAPP_API_PROVIDER ?? ''
  const apiUrl = process.env.WHATSAPP_API_URL ?? ''
  const instance = process.env.WHATSAPP_API_INSTANCE ?? ''
  const token = process.env.WHATSAPP_API_TOKEN ?? ''

  // Se não estiver configurado, silencia
  if (!provider || !instance || !token) {
    console.log('[whatsapp] API do WhatsApp não configurada nas variáveis de ambiente.')
    return { success: false, error: 'Variáveis de ambiente ausentes' }
  }

  const cleanPhone = formatPhoneForWhatsApp(phone)
  if (!cleanPhone) {
    return { success: false, error: 'Telefone inválido' }
  }

  try {
    let url = ''
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    let body: any = {}

    if (provider.toLowerCase() === 'z-api') {
      // Z-API Endpoint: URL/instances/INSTANCIA/token/TOKEN/send-text
      const baseUrl = apiUrl || 'https://api.z-api.io'
      url = `${baseUrl.replace(/\/$/, '')}/instances/${encodeURIComponent(instance)}/token/${token}/send-text`
      body = {
        phone: cleanPhone,
        message: message,
      }
    } else if (provider.toLowerCase() === 'evolution') {
      // Evolution API Endpoint: URL/message/sendText/INSTANCIA
      const baseUrl = apiUrl
      if (!baseUrl) throw new Error('Evolution API requer WHATSAPP_API_URL configurada')
      // Remove '/manager' ou '/manager/' se o usuário colocar por engano
      const cleanedBaseUrl = baseUrl.replace(/\/manager\/?$/, '').replace(/\/$/, '')
      url = `${cleanedBaseUrl}/message/sendText/${encodeURIComponent(instance)}`
      headers['apikey'] = token
      body = {
        number: cleanPhone,
        text: message,
      }
    } else {
      return { success: false, error: `Provedor desconhecido: ${provider}` }
    }

    console.log(`[whatsapp] enviando mensagem para ${cleanPhone} via ${provider}...`)

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const responseText = await res.text()

    if (!res.ok) {
      console.error(`[whatsapp] erro ao enviar mensagem via ${provider}:`, res.status, responseText)
      return { success: false, error: `API retornou status ${res.status}: ${responseText}` }
    }

    console.log(`[whatsapp] mensagem enviada com sucesso via ${provider}!`)
    return { success: true }
  } catch (err: any) {
    console.error('[whatsapp] falha de rede/erro inesperado:', err)
    return { success: false, error: err.message ?? 'Erro de rede' }
  }
}
