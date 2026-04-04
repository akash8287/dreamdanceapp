import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { addToMyList, isInMyList, removeFromMyList } from '../services/myListStorage';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export function PlayerScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { streamUrl, title, id } = route.params;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [inList, setInList] = useState(false);

  useEffect(() => {
    void isInMyList(id).then(setInList);
  }, [id]);

  const toggleList = useCallback(async () => {
    if (inList) {
      await removeFromMyList(id);
      setInList(false);
    } else {
      await addToMyList(id);
      setInList(true);
    }
  }, [id, inList]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={() => void toggleList()} style={styles.listBtn}>
          <Text style={styles.listBtnText}>{inList ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <Text style={styles.listHint}>
        {inList ? 'In my list' : 'Tap heart to add to my list'}
      </Text>
      <View style={styles.playerWrap}>
        {status === 'loading' ? (
          <View style={styles.spinner}>
            <Text style={styles.loadingTxt}>Loading…</Text>
          </View>
        ) : null}
        <Video
          style={styles.video}
          source={{ uri: streamUrl }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onLoadStart={() => setStatus('loading')}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      </View>
      {status === 'error' ? (
        <Text style={styles.errorBanner}>
          Could not play this stream. Check the URL and network (HTTP may need
          cleartext on Android).
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.bg,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  listBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listBtnText: {
    fontSize: 22,
    color: colors.accent,
  },
  listHint: {
    backgroundColor: colors.bg,
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  playerWrap: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    flex: 1,
    backgroundColor: '#000',
  },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingTxt: {
    color: colors.textMuted,
  },
  errorBanner: {
    color: colors.error,
    padding: 16,
    fontSize: 14,
    backgroundColor: colors.bg,
  },
});
