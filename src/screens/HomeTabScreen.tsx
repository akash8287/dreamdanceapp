import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoRail } from '../components/VideoRail';
import { useAppConfig } from '../context/AppConfigContext';
import { navigateToPlayer } from '../navigation/navigateToPlayer';
import { fetchFeaturedVideos, fetchVideos } from '../services/api';
import { colors } from '../theme/colors';
import type { GrooveXVideo } from '../types/video';

export function HomeTabScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const scrollRef = useRef<ScrollView>(null);
  const { apiBaseUrl } = useAppConfig();
  const [featured, setFeatured] = useState<GrooveXVideo[]>([]);
  const [auditions, setAuditions] = useState<GrooveXVideo[]>([]);
  const [dances, setDances] = useState<GrooveXVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!apiBaseUrl.trim()) {
      setError('Set your server URL in More → Admin setup.');
      setFeatured([]);
      setAuditions([]);
      setDances([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [feat, all] = await Promise.all([
        fetchFeaturedVideos(apiBaseUrl),
        fetchVideos(apiBaseUrl, 'all'),
      ]);
      setFeatured(feat);
      setAuditions(all.filter((v) => v.category === 'audition'));
      setDances(all.filter((v) => v.category === 'dance'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const hero = featured[0];
  const q = query.trim().toLowerCase();
  const filterList = (list: GrooveXVideo[]) =>
    q
      ? list.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.description.toLowerCase().includes(q)
        )
      : list;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.brandBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandGroove}>GROOVE</Text>
          <Text style={styles.brandX}>X</Text>
        </View>
        <Pressable
          style={styles.notifBtn}
          onPress={() => navigation.navigate('More')}
          hitSlop={8}
        >
          <Text style={styles.notifIcon}>⌕</Text>
        </Pressable>
      </View>

      <View style={styles.topBar}>
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shows, auditions, dances…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Pressable
          style={styles.gridBtn}
          onPress={() => navigation.navigate('More')}
        >
          <Text style={styles.gridBtnText}>☰</Text>
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <Pressable
          style={[styles.chip, !query && styles.chipActive]}
          onPress={() => {
            setQuery('');
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Text style={[styles.chipTxt, !query && styles.chipTxtActive]}>
            Trending
          </Text>
        </Pressable>
        <Pressable
          style={styles.chip}
          onPress={() => navigation.navigate('Auditions')}
        >
          <Text style={styles.chipTxt}>Auditions</Text>
        </Pressable>
        <Pressable
          style={styles.chip}
          onPress={() => navigation.navigate('Dances')}
        >
          <Text style={styles.chipTxt}>Dances</Text>
        </Pressable>
        <Pressable
          style={styles.chip}
          onPress={() => navigation.navigate('MyList')}
        >
          <Text style={styles.chipTxt}>My list</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {hero && !q ? (
          <Pressable
            style={styles.hero}
            onPress={() =>
              navigateToPlayer(navigation, {
                streamUrl: hero.streamUrl,
                title: hero.title,
                id: hero.id,
              })
            }
          >
            {hero.thumbnailUrl ? (
              <Image
                source={{ uri: hero.thumbnailUrl }}
                style={styles.heroImg}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImg, styles.heroPlaceholder]} />
            )}
            <View style={styles.heroOverlay} />
            <View style={styles.heroOrangeWash} />
            <View style={styles.heroTopBadges}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillTxt}>Featured</Text>
              </View>
              <View style={styles.heroPillBlue}>
                <Text style={styles.heroPillBlueTxt}>Trending now</Text>
              </View>
            </View>
            <View style={styles.heroPlay}>
              <Text style={styles.heroPlayText}>▶</Text>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.heroWatch}>Watch now</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {hero.title}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <Text style={styles.sectionLabel}>Trending</Text>
        <VideoRail
          title="Trending"
          videos={filterList(featured)}
          onSeeAll={() => navigation.navigate('Auditions')}
        />
        <VideoRail
          title="Auditions"
          videos={filterList(auditions).slice(0, 12)}
          onSeeAll={() => navigation.navigate('Auditions')}
        />
        <VideoRail
          title="Dances"
          videos={filterList(dances).slice(0, 12)}
          onSeeAll={() => navigation.navigate('Dances')}
        />

        {!loading && !featured.length && !auditions.length && !dances.length && apiBaseUrl ? (
          <Text style={styles.empty}>
            No videos yet. Upload from the admin page in your browser.
          </Text>
        ) : null}

        {loading && !featured.length ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandGroove: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.5,
  },
  brandX: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.accentSecondary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    color: colors.text,
    fontSize: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.chipInactive,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: {
    backgroundColor: 'rgba(255, 138, 60, 0.18)',
    borderColor: colors.accent,
  },
  chipTxt: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTxtActive: {
    color: colors.accent,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: colors.textMuted,
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 15,
  },
  gridBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnText: {
    color: colors.accentSecondary,
    fontSize: 18,
  },
  scroll: {
    paddingBottom: 32,
  },
  error: {
    color: colors.error,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  hero: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
    backgroundColor: colors.card,
  },
  heroImg: {
    width: '100%',
    height: 220,
  },
  heroPlaceholder: {
    backgroundColor: colors.bgElevated,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 9, 18, 0.45)',
  },
  heroOrangeWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: 'rgba(255, 138, 60, 0.12)',
  },
  heroTopBadges: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  heroPillTxt: {
    color: '#0a0e18',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroPillBlue: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(77, 163, 255, 0.25)',
    borderWidth: 1,
    borderColor: colors.accentSecondary,
  },
  heroPillBlueTxt: {
    color: colors.accentSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlayText: {
    color: '#0a0e18',
    fontSize: 22,
    marginLeft: 4,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroWatch: {
    color: colors.accentWarm,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionLabel: {
    display: 'none',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 16,
  },
});
