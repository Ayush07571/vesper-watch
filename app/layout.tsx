import type { Metadata } from 'next';
import { Tenor_Sans, Outfit } from 'next/font/google';
import './globals.css';

const tenorSans = Tenor_Sans({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'VESPER | The Equinox',
  description: 'Explore the intricate beauty of the Vesper Equinox. A symphony of 244 individual components, synchronized in perfect harmony.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${tenorSans.variable} ${outfit.variable}`}>
      <body className="antialiased">
        {/* Cinematic Overlays */}
        <div className="vignette" />
        <div className="grain">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.72"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
        
        {children}
      </body>
    </html>
  );
}
