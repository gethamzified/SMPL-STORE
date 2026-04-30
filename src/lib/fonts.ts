import { Manrope, Inter, Playfair_Display, Space_Mono, Cormorant_Garamond } from 'next/font/google'

export const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const manrope = Manrope({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

import { Great_Vibes } from 'next/font/google'

export const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
})

const fonts = {
  cormorant,
  manrope,
  inter,
  playfair,
  'space mono': spaceMono,
  spacemono: spaceMono,
  mono: spaceMono,
  script: manrope,
  greatVibes,
  helvetica: { variable: '--font-helvetica', className: 'font-helvetica' }
}

export function getFont(fontName: string) {
  const font = fonts[fontName as keyof typeof fonts] || fonts.manrope
  return font as any
}
