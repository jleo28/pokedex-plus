import { Inter, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const pressStart2P = localFont({
  src: '../public/fonts/PressStart2P.woff2',
  variable: '--font-pixel',
  display: 'swap',
  preload: true,
});
