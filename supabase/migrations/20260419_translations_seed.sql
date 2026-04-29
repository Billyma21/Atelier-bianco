-- Final Comprehensive Translation Seed for Atelier Bianco
-- This file contains all UI strings for both public and admin sides

-- 1. Ensure category column exists
ALTER TABLE public.translations ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 2. Clear existing to prevent conflicts
DELETE FROM public.translations;

-- 3. Insert all keys
INSERT INTO public.translations (key, fr, it, category)
VALUES 
-- Header & Navigation
('nav.home', 'Accueil', 'Home', 'common'),
('nav.catalog', 'Catalogue', 'Catalogo', 'common'),
('nav.maison', 'La Maison', 'La Maison', 'common'),
('nav.perfumes', 'Parfums', 'Profumi', 'common'),
('nav.faq', 'FAQ', 'FAQ', 'common'),
('nav.account', 'Mon Compte', 'Il Mio Account', 'common'),
('nav.search', 'Rechercher', 'Cerca', 'common'),
('nav.cart', 'Panier', 'Carrello', 'common'),
('nav.orders', 'Mes Commandes', 'I Miei Ordini', 'common'),

-- Home Page
('hero.label', 'Maison de Parfum de Niche', 'Casa di Profumi di Nicchia', 'home'),
('hero.cta_main', 'Découvrir la Collection', 'Scopri la Collezione', 'home'),
('hero.cta_secondary', 'Notre Histoire', 'La Nostra Storia', 'home'),
('hero.title_1', 'L''Éveil des', 'Il Risveglio dei', 'home'),
('hero.title_2', 'Sens', 'Sensi', 'home'),
('hero.desc', 'Découvrez une collection de fragrances rares.', 'Scopri una collezione di fragranze rare.', 'home'),
('home.selection', 'Sélection', 'Selezione', 'home'),
('home.bestsellers_title', 'Les Incontournables', 'I più venduti', 'home'),
('home.bestsellers_label', 'Sélection', 'Selezione', 'home'),
('home.bestsellers_cta', 'Voir tout le catalogue', 'Vedi tutto il catalogo', 'home'),
('home.collections_title', 'Nos Collections', 'Le nostre collezioni', 'home'),
('home.collections_label', 'Univers', 'Universo', 'home'),
('home.collections_cta', 'Découvrir', 'Scopri', 'home'),
('home.story_label', 'L''Art de l''Olfaction', 'L''arte de l''olfatto', 'home'),
('home.story_title_1', 'Une Maison de', 'Una Casa di', 'home'),
('home.story_title_2', 'Haute Parfumerie', 'Alta Profumeria', 'home'),
('home.story_desc', 'Atelier Bianco est né d''une volonté de revenir à l''essence même du parfum.', 'Atelier Bianco nasce dal desiderio di tornare all''essenza stessa del profumo.', 'home'),
('home.story_cta', 'Découvrir notre univers', 'Scopri il nostro universo', 'home'),

-- Catalog
('catalog.title', 'Nos Créations', 'Le Nostre Creazioni', 'product'),
('catalog.label', 'La Collection Complète', 'La Collezione Completa', 'product'),
('catalog.filters', 'Filtres Avancés', 'Filtri Avanzati', 'product'),
('catalog.no_results', 'Aucun produit ne correspond à votre recherche.', 'Nessun prodotto corrisponde alla tua ricerca.', 'product'),
('catalog.view_all', 'Voir tout le catalogue', 'Vedi tutto il catalogo', 'product'),
('catalog.family.all', 'Tous', 'Tutti', 'product'),
('catalog.family.floral', 'Floral', 'Floreale', 'product'),
('catalog.family.woody', 'Boisé', 'Legnoso', 'product'),
('catalog.family.oriental', 'Oriental', 'Orientale', 'product'),
('catalog.family.fresh', 'Frais', 'Fresco', 'product'),
('catalog.family.leather', 'Cuiré', 'Cuoiato', 'product'),

-- Product Detail
('product.add_to_cart', 'Ajouter au Panier', 'Aggiungi al carrello', 'product'),
('product.out_of_stock', 'Rupture de stock', 'Esaurito', 'product'),
('product.notify_me', 'Prévenez-moi', 'Avvisami', 'product'),
('product.notify_success', 'Merci ! Nous vous préviendrons par email.', 'Grazie! Ti avviseremo via email.', 'product'),
('product.description', 'Description', 'Descrizione', 'product'),
('product.olfactory_profile', 'Profil Olfactif', 'Profilo Olfattivo', 'product'),
('product.olfactory_profile_tab', 'Profil Olfactif', 'Profilo Olfattivo', 'product'),
('product.perfumer', 'Le Parfumeur', 'Il Profumiere', 'product'),
('product.the_nose', 'Le Nez', 'Il Naso', 'product'),
('product.reviews', 'Avis Clients', 'Recensioni Clienti', 'product'),
('product.notes_head', 'Notes de Tête', 'Note di Testa', 'product'),
('product.notes_heart', 'Notes de Coeur', 'Note di Cuore', 'product'),
('product.notes_base', 'Notes de Fond', 'Note di Fondo', 'product'),
('product.usage', 'Conseils d''utilisation', 'Consigli d''uso', 'product'),
('product.conservation', 'Conservation', 'Conservazione', 'product'),
('product.free_delivery', 'Livraison Offerte', 'Consegna gratuita', 'product'),
('product.secure_payment', 'Paiement Sécurisé', 'Pagamento Sicuro', 'product'),
('product.returns', 'Retours 30 Jours', 'Resi 30 giorni', 'product'),

-- Cart & Checkout
('cart.title', 'Votre Panier', 'Il tuo carrello', 'cart'),
('cart.empty', 'Votre panier est vide', 'Il tuo carrello è vuoto', 'cart'),
('cart.summary', 'Récapitulatif', 'Riepilogo', 'cart'),
('cart.subtotal', 'Sous-total', 'Sottototale', 'cart'),
('cart.shipping', 'Livraison', 'Spedizione', 'cart'),
('cart.total', 'Total', 'Totale', 'cart'),
('cart.checkout', 'Passer la commande', 'Procedi all''ordine', 'cart'),
('checkout.billing', 'Détails de facturation', 'Dettagli di fatturazione', 'cart'),
('checkout.shipping_address', 'Adresse de livraison', 'Indirizzo di spedizione', 'cart'),
('checkout.payment', 'Paiement', 'Pagamento', 'cart'),
('checkout.place_order', 'Confirmer la commande', 'Conferma l''ordine', 'cart'),
('checkout.success', 'Merci pour votre commande !', 'Grazie per il tuo ordine!', 'cart'),

-- Auth
('auth.login', 'Connexion', 'Accedi', 'auth'),
('auth.register', 'S''inscrire', 'Iscriviti', 'auth'),
('auth.email', 'Email', 'E-mail', 'auth'),
('auth.password', 'Mot de passe', 'Pass-word', 'auth'),
('auth.forgot_password', 'Mot de passe oublié ?', 'Password dimenticata?', 'auth'),
('auth.signin_google', 'Continuer avec Google', 'Continua con Google', 'auth'),
('auth.profile', 'Mon Profil', 'Il Mio Profilo', 'auth'),
('auth.logout', 'Déconnexion', 'Disconnettersi', 'auth'),

-- Footer
('footer.story', 'Maison de parfum de niche dédiée à l''art de l''olfaction.', 'Casa di profumi di nicchia dedicata all''arte dell''olfatto.', 'common'),
('footer.shop', 'Boutique', 'Negozio', 'common'),
('footer.all_perfumes', 'Tous les Parfums', 'Tutti i Profumi', 'common'),
('footer.house', 'Maison', 'Casa', 'common'),
('footer.our_story', 'Notre Histoire', 'La Nostra Storia', 'common'),
('footer.faq', 'Questions Fréquentes', 'Domande Frequenti', 'common'),
('footer.my_account', 'Mon Compte', 'Il Mio Account', 'common'),
('footer.newsletter', 'Newsletter', 'Newsletter', 'common'),
('footer.newsletter_desc', 'Inscrivez-vous pour recevoir nos actualités.', 'Iscriviti per ricevere le nostre news.', 'common'),
('footer.email_placeholder', 'Votre email', 'La tua email', 'common'),
('footer.subscribe', 'S''inscrire', 'Iscriviti', 'common'),
('footer.legal', 'Mentions Légales', 'Note Legali', 'common'),
('footer.terms', 'CGV', 'Termini', 'common'),
('footer.privacy', 'Confidentialité', 'Privacy', 'common'),

-- Product Tabs
('product.tab.description', 'Description', 'Descrizione', 'product'),
('product.tab.profile_olfactif', 'Profil Olfactif', 'Profilo Olfattivo', 'product'),
('product.tab.le_parfumeur', 'Le Parfumeur', 'Il Profumiere', 'product'),
('product.tab.avis_clients', 'Avis Clients', 'Recensioni', 'product'),

-- Reviews
('review.write', 'Partagez votre expérience', 'Condividi la tua esperienza', 'product'),
('review.login_required', 'Vous devez être connecté pour déposer un avis.', 'Devi aver effettuato l''accesso per lasciare una recensione.', 'product'),
('review.success', 'Merci ! Votre avis a été envoyé pour modération.', 'Grazie! La tua recensione è stata inviata per la moderazione.', 'product'),
('review.name', 'Votre Nom', 'Il tuo nome', 'product'),
('review.rating', 'Note', 'Voto', 'product'),
('review.comment', 'Votre avis', 'La tua recensione', 'product'),
('review.submit', 'Publier l''avis', 'Invia recensione', 'product'),
('review.empty', 'Soyez le premier à donner votre avis sur ce parfum.', 'Sii il primo a recensire questo profumo.', 'product'),
('review.pending', 'En attente de modération', 'In attesa di moderazione', 'product'),

-- Admin Navigation
('admin.nav.dashboard', 'Dashboard', 'Dashboard', 'admin'),
('admin.nav.products', 'Produits', 'Prodotti', 'admin'),
('admin.nav.collections', 'Collections', 'Collezioni', 'admin'),
('admin.nav.perfumers', 'Parfumeurs', 'Profumieri', 'admin'),
('admin.nav.orders', 'Commandes', 'Ordini', 'admin'),
('admin.nav.reviews', 'Avis Clients', 'Recensioni', 'admin'),
('admin.nav.faq', 'FAQ & Support', 'FAQ & Supporto', 'admin'),
('admin.nav.translations', 'Traductions', 'Traduzioni', 'admin'),
('admin.nav.clients', 'Base Clients', 'Clienti', 'admin'),
('admin.nav.design', 'Design Studio', 'Design Studio', 'admin'),
('admin.nav.marketing', 'Marketing', 'Marketing', 'admin'),
('admin.nav.notifications', 'Notifications', 'Notifiche', 'admin'),
('admin.nav.account', 'Compte Admin', 'Account Admin', 'admin'),
('admin.nav.settings', 'Paramètres', 'Impostazioni', 'admin'),
('admin.nav.view_site', 'Voir le Site', 'Vedi il Sito', 'admin'),

-- Common UI
('common.search', 'Rechercher...', 'Cerca...', 'common'),
('common.close', 'Fermer', 'Chiudi', 'common'),
('common.back', 'Retour', 'Indietro', 'common'),
('common.apply', 'Appliquer', 'Applica', 'common'),
('common.cancel', 'Annuler', 'Annulla', 'common'),
('common.save', 'Enregistrer', 'Salva', 'common'),
('common.loading', 'Chargement...', 'Caricamento...', 'common')
ON CONFLICT (key) DO NOTHING;
