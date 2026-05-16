'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/store/useWishlist';
import { useToast } from '@/store/useToast';

type Props = {
  productId: string;
  className?: string;
  size?: number;
};

export default function WishlistButton({ productId, className, size = 18 }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const ready = useWishlist((s) => s.ready);
  const isFavorite = useWishlist((s) => s.isFavorite);
  const toggle = useWishlist((s) => s.toggle);
  const [pending, setPending] = useState(false);

  const active = ready && isFavorite(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId || pending) return;

    setPending(true);
    const wasFavorite = active;
    const result = await toggle(productId);
    setPending(false);

    if (!result.ok && result.needsLogin) {
      toast.show(
        t('wishlist.login_required', 'Connectez-vous pour enregistrer vos favoris.'),
        'error'
      );
      const next = encodeURIComponent(pathname || '/');
      router.push(`/auth/login?next=${next}`);
      return;
    }

    if (!result.ok) {
      toast.show(t('wishlist.error', 'Impossible de mettre à jour vos favoris.'), 'error');
      return;
    }

    if (result.added) {
      toast.show(t('wishlist.added', 'Ajouté à votre liste d’envies.'));
    } else if (result.removed || wasFavorite) {
      toast.show(t('wishlist.removed', 'Retiré de votre liste d’envies.'));
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      aria-label={
        active
          ? t('wishlist.remove_aria', 'Retirer des favoris')
          : t('product.wishlist', 'Ajouter aux favoris')
      }
      className={cn(
        'touch-target rounded-full transition-colors disabled:opacity-50',
        active ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-gold',
        className
      )}
      onClick={handleClick}
    >
      <Heart size={size} strokeWidth={1.5} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
