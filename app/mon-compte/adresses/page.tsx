import AccountStubPage from '@/components/account/AccountStubPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes adresses | Atelier Bianco',
  description: 'Gestion des adresses de livraison — Atelier Bianco.',
};

export default function AccountAddressesPage() {
  return (
    <AccountStubPage
      titleKey="account.addresses_stub_title"
      descriptionKey="account.addresses_stub_desc"
      titleFallback="Mes adresses"
      descriptionFallback="La sauvegarde multi-adresses arrive très prochainement. En attendant, vous pouvez saisir votre adresse à chaque commande au moment du paiement ; elle est conservée avec votre commande pour toute question de livraison."
    />
  );
}
