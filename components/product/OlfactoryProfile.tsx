'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export type OlfactoryImageBlock = {
  url: string;
  caption?: string | null;
  alt?: string | null;
};

interface OlfactoryProfileProps {
  /** @deprecated Utiliser pyramidImage ; conservé pour rétrocompatibilité */
  diagramUrl?: string;
  title?: string;
  description?: string;
  /** Panneau éditorial (image + légende) au-dessus du schéma */
  storyPanel?: OlfactoryImageBlock | null;
  /** Schéma pyramide / architecture olfactive (image dédiée) */
  pyramidImage?: OlfactoryImageBlock | null;
  notes: {
    head: { name: string; image_url?: string }[];
    heart: { name: string; image_url?: string }[];
    base: { name: string; image_url?: string }[];
  };
}

export default function OlfactoryProfile({
  diagramUrl,
  title,
  description,
  storyPanel,
  pyramidImage,
  notes,
}: OlfactoryProfileProps) {
  const { t, language } = useLanguage();
  const pyramidSrc = pyramidImage?.url || diagramUrl;

  const NoteBubble = ({ note }: { note: { name: string; image_url?: string } }) => (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-brand-black/5 bg-white transition-all duration-500 group-hover:border-brand-gold group-hover:shadow-lg">
        {note.image_url ? (
          <div className="relative h-10 w-10">
            <Image
              src={note.image_url}
              alt={note.name}
              fill
              sizes="40px"
              className="object-contain transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/10">
            <span className="font-serif italic text-brand-gold">{note.name[0]}</span>
          </div>
        )}
      </div>
      <span className="font-sans text-[10px] uppercase tracking-widest opacity-60 transition-opacity group-hover:opacity-100">
        {note.name}
      </span>
    </div>
  );

  return (
    <div className="space-y-20 py-12 md:space-y-28 md:py-20">
      {/* Panneau narration — image pleine largeur, style éditorial luxe */}
      {storyPanel?.url && (
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-8 text-center">
            <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.45em] text-brand-gold">
              {t('olfactory.story_label', 'Univers sensoriel')}
            </span>
            <h3 className="font-serif text-3xl text-brand-black md:text-4xl">
              {title || t('product.olfactory_profile', 'Profil olfactif')}
            </h3>
            {description && (
              <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-brand-black/65">
                {description}
              </p>
            )}
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-black/[0.06] bg-[#FDFCFB] shadow-[0_32px_80px_-24px_rgba(10,10,10,0.18)] md:rounded-[2.5rem]">
            <div className="relative aspect-[21/9] min-h-[220px] w-full md:aspect-[2.4/1]">
              <Image
                src={storyPanel.url}
                alt={storyPanel.alt || storyPanel.caption || 'Atelier Bianco'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority={false}
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/55 via-transparent to-transparent" />
              {storyPanel.caption && (
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                  <p className="mx-auto max-w-3xl text-center font-serif text-sm italic leading-relaxed text-brand-cream/95 md:text-base">
                    {storyPanel.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Titre / description si pas de panneau image (évite doublon titre) */}
      {!storyPanel?.url && (title || description) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-4 block font-sans text-[10px] uppercase tracking-[0.4em] text-brand-gold">
            {t('olfactory.architecture', 'Architecture olfactive')}
          </span>
          {title && <h3 className="font-serif text-3xl text-brand-black md:text-4xl">{title}</h3>}
          {description && (
            <p className="mt-6 font-serif text-lg italic leading-relaxed text-brand-black/65">{description}</p>
          )}
        </motion.div>
      )}

      {/* Schéma pyramide / diagramme */}
      {pyramidSrc && (
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-10 text-center">
            <span className="mb-3 block font-sans text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              {t('olfactory.pyramid_label', 'Pyramide olfactive')}
            </span>
            {!storyPanel?.url && !title && (
              <h3 className="font-serif text-3xl text-brand-black md:text-4xl">
                {t('product.olfactory_profile', 'Profil olfactif')}
              </h3>
            )}
            {pyramidImage?.caption && (
              <p className="mx-auto mt-4 max-w-xl font-sans text-xs uppercase tracking-widest text-brand-black/45">
                {pyramidImage.caption}
              </p>
            )}
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-black/[0.06] bg-white shadow-[0_24px_64px_-20px_rgba(10,10,10,0.12)] md:rounded-[2.5rem]">
            <div className="relative aspect-video w-full min-h-[200px]">
              <Image
                src={pyramidSrc}
                alt={
                  pyramidImage?.alt ||
                  pyramidImage?.caption ||
                  (language === 'it' ? 'Diagramma olfattivo' : 'Schéma du profil olfactif')
                }
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* Pyramide notes — bulles */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-10 h-12 w-px bg-brand-gold/30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 w-full"
        >
          <span className="mb-8 block text-[9px] uppercase tracking-[0.3em] text-brand-gold">
            {t('olfactory.head_notes', 'Notes de tête')}
          </span>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {notes.head.map((note, i) => (
              <NoteBubble key={i} note={note} />
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xs font-sans text-[10px] uppercase tracking-widest text-brand-black/40">
            {t('olfactory.head_desc', "L'envolée immédiate, fraîche et volatile.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="mb-16 w-full"
        >
          <span className="mb-8 block text-[9px] uppercase tracking-[0.3em] text-brand-gold">
            {t('olfactory.heart_notes', 'Notes de cœur')}
          </span>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {notes.heart.map((note, i) => (
              <NoteBubble key={i} note={note} />
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xs font-sans text-[10px] uppercase tracking-widest text-brand-black/40">
            {t('olfactory.heart_desc', "L'âme du parfum, son caractère principal.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <span className="mb-8 block text-[9px] uppercase tracking-[0.3em] text-brand-gold">
            {t('olfactory.base_notes', 'Notes de fond')}
          </span>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {notes.base.map((note, i) => (
              <NoteBubble key={i} note={note} />
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xs font-sans text-[10px] uppercase tracking-widest text-brand-black/40">
            {t('olfactory.base_desc', 'Le sillage profond et durable.')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
