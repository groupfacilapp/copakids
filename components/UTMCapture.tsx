'use client'
import { useEffect } from 'react'
import { captureUTM } from '@/lib/utm'

// Componente invisível — captura UTMs da URL na primeira visita
export function UTMCapture() {
  useEffect(() => { captureUTM() }, [])
  return null
}
