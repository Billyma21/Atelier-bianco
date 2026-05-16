import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liste d’envies | Atelier Bianco',
  description: 'Vos parfums favoris — Atelier Bianco.',
};

export default function FavorisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
