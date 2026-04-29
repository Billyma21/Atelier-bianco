'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { useTheme } from '@/context/ThemeContext';
import { Save, Upload, RefreshCw } from 'lucide-react';

export default function DesignStudio() {
  const { settings, refreshSettings } = useTheme();
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  if (!localSettings) return <div>Chargement du studio...</div>;

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: 'theme_colors', value: localSettings.colors },
        { key: 'typography', value: localSettings.typography },
        { key: 'header_settings', value: localSettings.header },
      ];

      for (const update of updates) {
        await supabase.from('site_settings').update({ value: update.value }).eq('key', update.key);
      }

      await refreshSettings();
      useToast.getState().show('Paramètres enregistrés avec succès', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      useToast.getState().show('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateColor = (key: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      colors: { ...localSettings.colors, [key]: value }
    });
  };

  const updateHeader = (key: string, value: any) => {
    setLocalSettings({
      ...localSettings,
      header: { ...localSettings.header, [key]: value }
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-serif mb-2">Design Studio</h1>
          <p className="text-xs uppercase tracking-widest text-brand-black/40">Personnalisez l&apos;apparence de votre maison sans code</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="luxury-button flex items-center gap-3"
        >
          <Save size={16} />
          {loading ? 'Enregistrement...' : 'Publier les changements'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Colors Section */}
        <div className="bg-white p-8 border border-brand-black/5 shadow-sm">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans text-brand-gold mb-8">Palette de Couleurs</h2>
          <div className="space-y-6">
            {Object.entries(localSettings.colors).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-xs font-sans capitalize">{key.replace('_', ' ')}</label>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-brand-black/40 uppercase">{value}</span>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-10 h-10 rounded-full border-none cursor-pointer overflow-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white p-8 border border-brand-black/5 shadow-sm">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans text-brand-gold mb-8">Identité & Header</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Type de Logo</label>
              <select
                value={localSettings.header.logo_type}
                onChange={(e) => updateHeader('logo_type', e.target.value)}
                className="luxury-input"
              >
                <option value="text">Texte</option>
                <option value="image">Image (PNG/JPG)</option>
              </select>
            </div>

            {localSettings.header.logo_type === 'text' ? (
              <div>
                <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Texte du Logo</label>
                <input
                  type="text"
                  value={localSettings.header.logo_text}
                  onChange={(e) => updateHeader('logo_text', e.target.value)}
                  className="luxury-input"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">URL du Logo (PNG sans fond recommandé)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings.header.logo_url}
                    onChange={(e) => updateHeader('logo_url', e.target.value)}
                    className="luxury-input flex-1"
                    placeholder="https://..."
                  />
                  <button className="p-2 border border-brand-black/10 hover:bg-brand-black/5 transition-colors">
                    <Upload size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-brand-black/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-sans">Afficher le bandeau promo</label>
                <input
                  type="checkbox"
                  checked={localSettings.header.show_announcement}
                  onChange={(e) => updateHeader('show_announcement', e.target.checked)}
                  className="accent-brand-gold"
                />
              </div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Texte du bandeau</label>
              <input
                type="text"
                value={localSettings.header.announcement_text}
                onChange={(e) => updateHeader('announcement_text', e.target.value)}
                className="luxury-input"
              />
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-white p-8 border border-brand-black/5 shadow-sm md:col-span-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-sans text-brand-gold mb-8">Typographie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Police des Titres</label>
              <select
                value={localSettings.typography.heading_font}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  typography: { ...localSettings.typography, heading_font: e.target.value }
                })}
                className="luxury-input"
              >
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Police du Corps</label>
              <select
                value={localSettings.typography.body_font}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  typography: { ...localSettings.typography, body_font: e.target.value }
                })}
                className="luxury-input"
              >
                <option value="Inter">Inter</option>
                <option value="Raleway">Raleway</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Taille de base</label>
              <input
                type="text"
                value={localSettings.typography.base_size}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  typography: { ...localSettings.typography, base_size: e.target.value }
                })}
                className="luxury-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Hint */}
      <div className="mt-12 p-6 bg-brand-gold/10 border border-brand-gold/20 flex items-center gap-4">
        <RefreshCw size={20} className="text-brand-gold animate-spin-slow" />
        <p className="text-xs font-sans text-brand-gold-dark">
          Les changements sont appliqués en temps réel sur les variables CSS du site. Cliquez sur &quot;Publier&quot; pour les rendre permanents.
        </p>
      </div>
    </div>
  );
}
