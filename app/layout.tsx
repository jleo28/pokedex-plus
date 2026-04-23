import type { Metadata } from 'next';
import { inter, ibmPlexMono, pressStart2P } from './fonts';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SoundProvider } from '@/components/layout/SoundProvider';
import { NavBar } from '@/components/layout/NavBar';
import { CRTOverlay } from '@/components/layout/CRTOverlay';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Pokédex++', template: '%s · Pokédex++' },
  description:
    'Browse all 386 Gen 1–3 Pokémon, build teams, compare stats, and see two sklearn ML models in action. Built with Next.js 14 and Supabase.',
  metadataBase: new URL('https://pokedexpp.vercel.app'),
  openGraph: {
    title: 'Pokédex++',
    description: 'Browse Gen 1–3 Pokémon, build teams, and explore ML predictions. Built with Next.js 14 and Supabase.',
    url: 'https://pokedexpp.vercel.app',
    siteName: 'Pokédex++',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Pokédex++' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokédex++',
    description: 'Browse Gen 1–3 Pokémon, build teams, and explore ML predictions.',
    images: ['/og'],
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} ${pressStart2P.variable}`}>
        <ThemeProvider>
          <SoundProvider>
            <NavBar />
            {children}
            <CRTOverlay />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
