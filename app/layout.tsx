import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/Toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://daansetu.in'),
  title: {
    default: 'DaanSetu — A meal, traced from your hand to theirs',
    template: '%s · DaanSetu',
  },
  description:
    'Scan a restaurant’s code, fund a meal, and follow it through every step until an NGO confirms it was received. Transparent meal donation across India.',
  openGraph: {
    title: 'DaanSetu — A meal, traced from your hand to theirs',
    description:
      'Fund a meal at your favourite restaurant and follow it through every step until it is served.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#faf8f3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
