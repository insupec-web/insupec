import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/hooks/CartProvider';
import { AuthProvider } from '@/hooks/AuthProvider';
import ConditionalHeader from '@/components/ConditionalHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'INSUPEC - Plataforma de Pedidos Online',
  description: 'Plataforma de pedidos online de INSUPEC. Compra productos frescos en línea.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <CartProvider>
          <AuthProvider>
            <ConditionalHeader />
            <main className="pt-20 sm:pt-24 flex-1">{children}</main>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
