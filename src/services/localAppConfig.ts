import * as SecureStore from 'expo-secure-store';

const KEY_API = 'groovex_api_base_url';

/** Trimmed base URL without trailing slash, e.g. http://192.168.1.5:3001 */
export async function loadStoredApiBaseUrl(): Promise<string> {
  const v = await SecureStore.getItemAsync(KEY_API);
  return (v ?? '').trim();
}

export async function saveStoredApiBaseUrl(url: string): Promise<void> {
  const t = url.trim().replace(/\/+$/, '');
  await SecureStore.setItemAsync(KEY_API, t);
}
