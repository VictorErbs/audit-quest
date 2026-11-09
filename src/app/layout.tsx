import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Audit Quest — Operação Transparência (NBC PA 11)',
  description: 'Jogo investigativo estilo Pokémon em Pixel Art para estudantes de Ciências Contábeis sobre Governança, Pessoal, Qualidade e Informações Financeiras.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
