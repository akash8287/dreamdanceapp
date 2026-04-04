import Constants from 'expo-constants';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadStoredApiBaseUrl,
  saveStoredApiBaseUrl,
} from '../services/localAppConfig';

type ConfigExtra = {
  apiBaseUrl?: string;
};

function envDefaultApiUrl(): string {
  const extra = Constants.expoConfig?.extra as ConfigExtra | undefined;
  return (
    (extra?.apiBaseUrl as string | undefined)?.trim() ??
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ??
    ''
  );
}

type AppConfigContextValue = {
  apiBaseUrl: string;
  loaded: boolean;
  reload: () => Promise<void>;
  setApiBaseUrl: (url: string) => Promise<void>;
};

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [apiBaseUrl, setUrl] = useState('');
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const stored = await loadStoredApiBaseUrl();
    const merged = stored || envDefaultApiUrl();
    setUrl(merged);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setApiBaseUrl = useCallback(
    async (url: string) => {
      await saveStoredApiBaseUrl(url);
      await reload();
    },
    [reload]
  );

  const value = useMemo<AppConfigContextValue>(
    () => ({
      apiBaseUrl,
      loaded,
      reload,
      setApiBaseUrl,
    }),
    [apiBaseUrl, loaded, reload, setApiBaseUrl]
  );

  return (
    <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfigContextValue {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return ctx;
}
