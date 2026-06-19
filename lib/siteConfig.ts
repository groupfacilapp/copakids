/**
 * Central configuration — all values can be overridden via environment variables.
 * To replicate this project for another team/sport:
 *   1. Set the env vars below in your .env.local / Vercel dashboard
 *   2. Replace public/assets/jersey_reference.png  (athlete reference photo)
 *   3. Replace public/assets/template.png          (sticker card design)
 */

export const siteConfig = {
  // ── Identidade do projeto ────────────────────────────────────────────────
  projectName:    process.env.NEXT_PUBLIC_PROJECT_NAME    ?? 'Convoca Kids',
  baseUrl:        process.env.NEXT_PUBLIC_BASE_URL        ?? 'https://www.convocakids.com',
  emailFrom:      process.env.EMAIL_FROM                  ?? 'Convoca Kids <contato@convocakids.com>',

  // ── Checkout / preço ────────────────────────────────────────────────────
  checkoutUrl:    process.env.NEXT_PUBLIC_CHECKOUT_URL    ?? 'https://pay.kiwify.com.br/yRmTtd1',
  price:          process.env.NEXT_PUBLIC_PRICE           ?? '12,90',
  priceOriginal:  process.env.NEXT_PUBLIC_PRICE_ORIGINAL  ?? '29,90',
  priceNumber:    parseFloat(process.env.NEXT_PUBLIC_PRICE?.replace(',', '.') ?? '12.90'),

  // ── IA — imagem de referência e prompt ──────────────────────────────────
  // jersey_reference.png deve ser substituído pela foto do atleta de referência
  referenceImageFile: process.env.AI_REFERENCE_IMAGE_FILE ?? 'jersey_reference.png',

  // Prompt enviado ao gpt-image-2. Customize o nome do atleta e a descrição da camisa.
  aiPrompt: process.env.AI_PROMPT ??
    'The first image is Neymar wearing the Brazil national team jersey. ' +
    'The second image is a different person. ' +
    'Replace Neymar with the person from the second image. ' +
    'Keep everything else exactly the same: jersey, pose, framing, lighting and background. ' +
    'Preserve the exact face, skin tone, hair and age from the second image.',

  // ── Watermark ───────────────────────────────────────────────────────────
  watermarkText:  process.env.NEXT_PUBLIC_WATERMARK_TEXT  ?? 'CONVOCA KIDS',
}
