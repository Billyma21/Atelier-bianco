'use client';

import { useEffect } from 'react';
import { useToast } from '@/store/useToast';

export default function ToastHost() {
  const message = useToast((s) => s.message);
  const variant = useToast((s) => s.variant);
  const hide = useToast((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => hide(), 5000);
    return () => window.clearTimeout(t);
  }, [message, hide]);

  if (!message) return null;

  const isError = variant === 'error';

  return (
    <div
      role="status"
      className={`fixed bottom-8 left-1/2 z-[9999] max-w-[min(90vw,28rem)] -translate-x-1/2 px-6 py-4 text-center text-sm shadow-2xl ${
        isError
          ? 'border border-red-200 bg-red-50 text-red-900'
          : 'border border-brand-black/10 bg-white text-brand-black'
      }`}
    >
      <p className="font-sans leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={hide}
        className="mt-3 text-[10px] uppercase tracking-widest text-brand-black/50 hover:text-brand-gold"
      >
        Fermer
      </button>
    </div>
  );
}
