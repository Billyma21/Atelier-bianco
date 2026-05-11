import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="flex min-h-[60vh] items-center justify-center px-6 pb-20 pt-32">
        <div className="w-full max-w-md rounded-sm border border-brand-black/5 bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 font-serif text-2xl">Session introuvable</h1>
          <p className="mb-8 text-sm text-brand-black/60">
            Le lien de connexion a expiré ou est invalide. Réessayez depuis la page de connexion, ou activez le fournisseur
            (Google) dans Supabase si vous utilisez OAuth.
          </p>
          <Link href="/auth/login" className="luxury-button inline-block px-8 py-4 text-[10px] uppercase tracking-widest">
            Retour à la connexion
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
