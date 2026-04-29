'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  typography: {
    heading_font: string;
    body_font: string;
    base_size: string;
  };
  header: {
    logo_type: 'text' | 'image';
    logo_text: string;
    logo_url: string;
    show_announcement: boolean;
    announcement_text: string;
  };
}

const ThemeContext = createContext<{
  settings: ThemeSettings | null;
  refreshSettings: () => Promise<void>;
}>({
  settings: null,
  refreshSettings: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const refreshSettings = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) return;

    const formattedSettings: any = {};
    data.forEach((item) => {
      if (item.key === 'theme_colors') formattedSettings.colors = item.value;
      if (item.key === 'typography') formattedSettings.typography = item.value;
      if (item.key === 'header_settings') formattedSettings.header = item.value;
    });

    setSettings(formattedSettings as ThemeSettings);

    const root = document.documentElement;
    if (formattedSettings.colors) {
      root.style.setProperty('--color-brand-black', formattedSettings.colors.primary);
      root.style.setProperty('--color-brand-cream', formattedSettings.colors.background);
      root.style.setProperty('--color-brand-gold', formattedSettings.colors.accent);
      root.style.setProperty('--color-text', formattedSettings.colors.text);
    }

    if (formattedSettings.typography) {
      root.style.setProperty('--font-serif', formattedSettings.typography.heading_font);
      root.style.setProperty('--font-sans', formattedSettings.typography.body_font);
      root.style.setProperty('font-size', formattedSettings.typography.base_size);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error || !isMounted) return;

      const formattedSettings: any = {};
      data.forEach((item) => {
        if (item.key === 'theme_colors') formattedSettings.colors = item.value;
        if (item.key === 'typography') formattedSettings.typography = item.value;
        if (item.key === 'header_settings') formattedSettings.header = item.value;
      });

      setSettings(formattedSettings as ThemeSettings);

      const root = document.documentElement;
      if (formattedSettings.colors) {
        root.style.setProperty('--color-brand-black', formattedSettings.colors.primary);
        root.style.setProperty('--color-brand-cream', formattedSettings.colors.background);
        root.style.setProperty('--color-brand-gold', formattedSettings.colors.accent);
        root.style.setProperty('--color-text', formattedSettings.colors.text);
      }

      if (formattedSettings.typography) {
        root.style.setProperty('--font-serif', formattedSettings.typography.heading_font);
        root.style.setProperty('--font-sans', formattedSettings.typography.body_font);
        root.style.setProperty('font-size', formattedSettings.typography.base_size);
      }
    };

    init();
    
    return () => { isMounted = false; };
  }, [supabase]);

  return (
    <ThemeContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
