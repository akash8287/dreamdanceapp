import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigateToPlayer } from '../navigation/navigateToPlayer';
import { useAppConfig } from '../context/AppConfigContext';
import { fetchVideos } from '../services/api';
import { getMyListIds, removeFromMyList } from '../services/myListStorage';
import { colors } from '../theme/colors';
import type { GrooveXVideo } from '../types/video';

export function MyListTabScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { apiBaseUrl } = useAppConfig();
  const [items, setItems] = useState<GrooveXVideo[]>([]);

  const refresh = useCallback(async () => {
    if (!apiBaseUrl.trim()) {
      setItems([]);
      return;
    }
    const ids = await getMyListIds();
    if (!ids.length) {
      setItems([]);
      return;
    }
    try {
      const all = await fetchVideos(apiBaseUrl, 'all');
      const ordered = ids
        .map((id) => all.find((v) => v.id === id))
        .filter((v): v is GrooveXVideo => Boolean(v));
      setItems(ordered);
    } catch {
      setItems([]);
    }
  }, [apiBaseUrl]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.header}>My list</Text>
      <Text style={styles.sub}>
        Save items from the player screen. Stored only on this device.
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nothing saved yet. Open a video and tap “Add to my list”.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={styles.rowMain}
              onPress={() =>
                navigateToPlayer(navigation, {
                  streamUrl: item.streamUrl,
                  title: item.title,
                  id: item.id,
                })
              }
            >
              <View style={styles.thumbWrap}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumb, styles.ph]}>
                    <Text style={styles.phTxt}>{item.title.slice(0, 1)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.txt}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.meta}>{item.category}</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.trash}
              onPress={() => void removeFromMyList(item.id).then(refresh)}
            >
              <Text style={styles.trashTxt}>🗑</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  thumbWrap: {
    width: 72,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: { width: 72, height: 90 },
  ph: {
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phTxt: { color: colors.accent, fontSize: 24, fontWeight: '700' },
  txt: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  trash: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  trashTxt: { fontSize: 20 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
});
