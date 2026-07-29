import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/hooks/CartProvider';
import { AuthProvider } from '@/hooks/AuthProvider';
import ConditionalHeader from '@/components/ConditionalHeader';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';
import PageTracker from '@/components/PageTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'INSUPEC - Farmacia Online de Confianza | Medicamentos Auténticos',
  description: 'Compra medicamentos y productos de salud auténticos en línea. Envío rápido 24-72h a todo el país. Farmacia verificada y segura. Atención 24/7 en WhatsApp.',
  keywords: 'farmacia online, medicamentos, productos de salud, envío a domicilio, farmacia argentina',
  openGraph: {
    title: 'INSUPEC - Tu Farmacia de Confianza',
    description: 'Medicamentos y productos de salud 100% auténticos. Envío rápido y seguro.',
    type: 'website',
    url: 'https://insupec.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <PageTracker />
        <CartProvider>
          <AuthProvider>
            <ConditionalHeader />
            <main className="pt-20 sm:pt-24 flex-1">{children}</main>
            <WhatsAppButton />
            <BackToTop />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
