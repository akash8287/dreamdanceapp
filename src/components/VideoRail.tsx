import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { navigateToPlayer } from '../navigation/navigateToPlayer';
import { colors } from '../theme/colors';
import type { GrooveXVideo } from '../types/video';

type Props = {
  title: string;
  videos: GrooveXVideo[];
  onSeeAll?: () => void;
};

export function VideoRail({ title, videos, onSeeAll }: Props) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  if (!videos.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.titleAccent} />
          </View>
        </View>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={videos}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
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
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbLetter}>
                    {item.title.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.playBadge}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const CARD_W = 132;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titleAccent: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accentSecondary,
  },
  seeAll: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: CARD_W,
  },
  thumbWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thumb: {
    width: CARD_W,
    height: CARD_W * 1.35,
    borderRadius: 14,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    color: colors.accentSecondary,
    fontSize: 36,
    fontWeight: '700',
  },
  playBadge: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    color: '#0a0e18',
    fontSize: 14,
    marginLeft: 2,
  },
  cardTitle: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
