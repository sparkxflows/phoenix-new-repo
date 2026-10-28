import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface LogoSettings {
  customLogoUrl: string | null;
  logoShape: 'circle' | 'rounded' | 'original';
  showBorder: boolean;
  borderColor: string;
  backgroundColor: string;
  updatedAt?: string;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  customLogoUrl: '/assets/aistudio/unnamed__3__df6a950e.png',
  logoShape: 'circle',
  showBorder: true,
  borderColor: '#FFD60A',
  backgroundColor: '#FFD60A',
};

const STORAGE_KEY = 'phoenix_studio_logo_settings_v2';
const LOGO_UPDATED_EVENT = 'phoenix_studio_logo_updated';

/**
 * Retrieves the current logo settings from storage.
 */
export function getStoredLogoSettings(): LogoSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_LOGO_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading stored logo settings:', e);
  }
  return DEFAULT_LOGO_SETTINGS;
}

/**
 * Saves updated logo settings to local storage and syncs with Supabase.
 */
export async function saveLogoSettings(settings: LogoSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save locally for instant zero-latency loading across all pages
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // 2. Dispatch event so any mounted PhoenixLogo component immediately re-renders
    window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: payload }));

    // 3. Sync to Express server store
    try {
      await fetch('/api/content/custom_logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: payload }),
      });
    } catch {}

    // 4. Sync to Supabase site_settings / studio_branding if table exists
    try {
      await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'custom_logo',
            value: payload,
            updated_at: new Date().toISOString(),
          },
        ]);
    } catch (err) {
      // Non-blocking sync error
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save logo settings.' };
  }
}

/**
 * Resets the logo back to the original default Phoenix Tattooz circular seal.
 */
export async function resetToDefaultLogo(): Promise<{ success: boolean }> {
  const defaultPayload = {
    ...DEFAULT_LOGO_SETTINGS,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPayload));
  window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: defaultPayload }));

  try {
    await supabase
      .from('site_settings')
      .upsert([
        {
          key: 'custom_logo',
          value: defaultPayload,
          updated_at: new Date().toISOString(),
        },
      ]);
  } catch (err) {
    // Non-blocking
  }

  return { success: true };
}

/**
 * React hook to listen for real-time logo updates across the app.
 */
export function useLogoSettings(): LogoSettings {
  const [settings, setSettings] = useState<LogoSettings>(getStoredLogoSettings);

  useEffect(() => {
    // Initial fetch from server and Supabase
    const fetchRemote = async () => {
      // 1. Try Express server storage first
      try {
        const srvRes = await fetch('/api/content/custom_logo', { cache: 'no-store' });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData && srvData.success && srvData.value) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(srvData.value));
            setSettings(srvData.value);
            return;
          }
        }
      } catch {}

      // 2. Fallback to Supabase
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'custom_logo')
          .limit(1);

        if (!error && data && data.length > 0 && data[0].value) {
          const remoteSettings = data[0].value;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteSettings));
          setSettings(remoteSettings);
        }
      } catch (e) {
        // Fallback to local
      }
    };

    fetchRemote();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LogoSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getStoredLogoSettings());
      }
    };

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchRemote();
      }
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', fetchRemote);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', fetchRemote);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return settings;
}
