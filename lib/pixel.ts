export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1361619072486411'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function fbq(...args: any[]): void
}

export function pixelEvent(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof fbq === 'function') fbq('track', event, params)
  } catch { /* pixel not loaded */ }
}
