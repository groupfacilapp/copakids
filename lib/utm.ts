export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const STORAGE_KEY = '_utm_first'

// Extrai UTMs da query string
export function parseUTM(search: string): UTMParams | null {
  const p = new URLSearchParams(search)
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
  const params: UTMParams = {}
  let any = false
  for (const k of keys) {
    const v = p.get(k)
    if (v) { params[k] = v; any = true }
  }
  return any ? params : null
}

// Salva apenas na primeira visita com UTM (first-touch attribution)
export function captureUTM(): void {
  try {
    const current = parseUTM(window.location.search)
    if (current && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    }
  } catch { /* SSR ou storage bloqueado */ }
}

export function readUTM(): UTMParams | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UTMParams) : null
  } catch { return null }
}

// Adiciona UTMs como query params na URL do checkout
export function appendUTMToUrl(base: string, utm: UTMParams | null): string {
  if (!utm) return base
  try {
    const url = new URL(base)
    Object.entries(utm).forEach(([k, v]) => { if (v) url.searchParams.set(k, v) })
    return url.toString()
  } catch { return base }
}
