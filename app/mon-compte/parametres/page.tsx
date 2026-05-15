import AccountStubPage from '@/components/account/AccountStubPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paramètres du compte | Atelier Bianco',
  description: 'Informations personnelles et préférences — Atelier Bianco.',
};

export default function AccountSettingsPage() {
  return (
    <AccountStubPage
      titleKey="account.settings_stub_title"
      descriptionKey="account.settings_stub_desc"
      titleFallback="Paramètres"
      descriptionFallback="La modification détaillée du profil (nom, e-mail, langue) sera accessible ici. Pour toute mise à jour urgente concernant une commande en cours, contactez-nous via les informations figurant sur votre confirmation d’achat."
    />
  );
}
