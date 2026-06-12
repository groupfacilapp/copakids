/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Impede carregamento em iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Impede MIME-sniffing (XSS via upload)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limita referrer em requests externos
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desabilita acesso a câmera/microfone/localização via JS
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Força HTTPS por 2 anos (Vercel já faz, mas reforça no browser)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['@napi-rs/canvas', 'sharp'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
