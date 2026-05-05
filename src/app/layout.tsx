import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChambaLatinApp',
  description: 'Conectamos talento con oportunidades — empleos en EE.UU. para la comunidad latina.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
