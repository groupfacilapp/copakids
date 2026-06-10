/**
 * Cache em memória para imagens geradas pela IA (OpenAI gpt-image-1).
 * Armazena o base64 temporariamente durante o pipeline de geração.
 * Entradas expiram após 10 minutos.
 */
import { randomBytes } from 'crypto'

interface CacheEntry {
  b64: string
  expiresAt: number
}

// Singleton global para persistir entre requests no mesmo processo Next.js
declare global {
  // eslint-disable-next-line no-var
  var __imageCache: Map<string, CacheEntry> | undefined
}

function getCache(): Map<string, CacheEntry> {
  if (!global.__imageCache) {
    global.__imageCache = new Map()
  }
  return global.__imageCache
}

function purgeExpired(cache: Map<string, CacheEntry>) {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key)
  }
}

/**
 * Armazena um base64 no cache e retorna um ID curto.
 * @param b64 - string base64 da imagem PNG
 * @returns id curto (16 bytes hex)
 */
export function storeImage(b64: string): string {
  const cache = getCache()
  purgeExpired(cache)
  const id = randomBytes(16).toString('hex')
  cache.set(id, { b64, expiresAt: Date.now() + 10 * 60 * 1000 }) // 10 min
  return id
}

/**
 * Recupera um base64 pelo ID. Retorna null se não encontrado ou expirado.
 */
export function retrieveImage(id: string): string | null {
  const cache = getCache()
  const entry = cache.get(id)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(id)
    return null
  }
  // Remove após consumir (single-use)
  cache.delete(id)
  return entry.b64
}
