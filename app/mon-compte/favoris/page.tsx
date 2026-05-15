import AccountStubPage from '@/components/account/AccountStubPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liste d’envies | Atelier Bianco',
  description: 'Vos parfums favoris — Atelier Bianco.',
};

export default function AccountWishlistPage() {
  return (
    <AccountStubPage
      titleKey="account.favorites_stub_title"
      descriptionKey="account.favorites_stub_desc"
      titleFallback="Favoris"
      descriptionFallback="Votre wishlist sera proposée ici pour retrouver facilement vos créations préférées. D’ici là, explorez le catalogue et ajoutez vos extraits au panier lorsque vous souhaitez commander."
    />
  );
}
