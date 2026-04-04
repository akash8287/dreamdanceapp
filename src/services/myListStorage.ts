import * as SecureStore from 'expo-secure-store';

const KEY = 'groovex_my_list_ids';

export async function getMyListIds(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function addToMyList(id: string): Promise<void> {
  const cur = await getMyListIds();
  if (cur.includes(id)) return;
  cur.unshift(id);
  await SecureStore.setItemAsync(KEY, JSON.stringify(cur.slice(0, 200)));
}

export async function removeFromMyList(id: string): Promise<void> {
  const cur = await getMyListIds();
  await SecureStore.setItemAsync(
    KEY,
    JSON.stringify(cur.filter((x) => x !== id))
  );
}

export async function isInMyList(id: string): Promise<boolean> {
  const cur = await getMyListIds();
  return cur.includes(id);
}
