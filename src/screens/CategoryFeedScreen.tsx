import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigateToPlayer } from '../navigation/navigateToPlayer';
import { useAppConfig } from '../context/AppConfigContext';
import { fetchVideos } from '../services/api';
import { colors } from '../theme/colors';
import type { GrooveXVideo, VideoCategory } from '../types/video';

type Props = {
  category: VideoCategory;
  title: string;
};

export function CategoryFeedScreen({ category, title }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { apiBaseUrl } = useAppConfig();
  const [videos, setVideos] = useState<GrooveXVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!apiBaseUrl.trim()) {
      setError('Set server URL in More → Admin setup.');
      setVideos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await fetchVideos(apiBaseUrl, category);
      setVideos(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.header}>{title}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No {title.toLowerCase()} yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.rowItem}
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
                  <Text style={styles.phText}>{item.title.slice(0, 1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.rowText}>
              <Text style={styles.tileTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta}>{item.category}</Text>
            </View>
            <View style={styles.playIcon}>
              <Text style={styles.playTxt}>▶</Text>
            </View>
          </Pressable>
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
    paddingBottom: 12,
    letterSpacing: 0.3,
  },
  error: {
    color: colors.error,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thumbWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    width: 88,
    height: 110,
    backgroundColor: colors.bgElevated,
  },
  thumb: {
    width: 88,
    height: 110,
  },
  ph: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  phText: {
    fontSize: 28,
    color: colors.accent,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTxt: {
    color: '#0a0e18',
    marginLeft: 3,
    fontSize: 14,
  },
  tileTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
});
