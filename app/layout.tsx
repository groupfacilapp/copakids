import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Barlow } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Figurinha da Copa 2026 — Transforme seu filho em um Craque!',
  description:
    'Crie a figurinha personalizada do seu filho no estilo oficial da Copa do Mundo 2026. Arquivo digital pra imprimir. +25.000 figurinhas criadas!',
  keywords: 'figurinha copa 2026, figurinha personalizada, panini copa do mundo, figurinha filho',
  openGraph: {
    title: 'Figurinha da Copa 2026',
    description: 'Transforme seu filho em um craque da Copa!',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFD500',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  )
}
