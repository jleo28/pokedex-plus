import type { Metadata } from 'next';
import { inter, ibmPlexMono, pressStart2P } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokédex++',
  description: 'A Next.js Pokédex with ML predictions. Gen 1–3, 386 Pokémon.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} ${pressStart2P.variable}`}>
        {children}
      </body>
    </html>
  );
}
