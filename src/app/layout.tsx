import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AHHHMETV - Meet New People Instantly | Random Video Chat',
  description: 'Connect with people from around the world through instant random video chat. AHHHMETV is the premium platform for spontaneous conversations.',
  keywords: ['video chat', 'random chat', 'meet people', 'social platform', 'video calling'],
  openGraph: {
    title: 'AHHHMETV - Meet New People Instantly',
    description: 'Connect with people from around the world through instant random video chat.',
    type: 'website',
    locale: 'en_US',
    siteName: 'AHHHMETV',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AHHHMETV - Meet New People Instantly',
    description: 'Connect with people from around the world through instant random video chat.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-white`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Script src="https://pl30708377.effectivecpmnetwork.com/34/ea/0d/34ea0dd7e623cc4c186fa69f7dfa0a7f.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
