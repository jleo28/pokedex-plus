import type { Metadata } from 'next';
import { inter, ibmPlexMono, pressStart2P } from './fonts';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SoundProvider } from '@/components/layout/SoundProvider';
import { NavBar } from '@/components/layout/NavBar';
import { CRTOverlay } from '@/components/layout/CRTOverlay';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokédex++',
  description: 'A Next.js Pokédex with ML predictions. Gen 1–3, 386 Pokémon.',
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
