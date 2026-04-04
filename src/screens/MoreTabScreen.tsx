import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppConfig } from '../context/AppConfigContext';
import { fetchHealth } from '../services/api';
import { colors } from '../theme/colors';

export function MoreTabScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { apiBaseUrl } = useAppConfig();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const ping = useCallback(async () => {
    if (!apiBaseUrl.trim()) {
      setStatus('No server URL set.');
      return;
    }
    setChecking(true);
    setStatus(null);
    try {
      const h = await fetchHealth(apiBaseUrl);
      setStatus(h.ok ? 'Connected to GrooveX API.' : 'Unexpected response.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setChecking(false);
    }
  }, [apiBaseUrl]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.header}>More</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Server</Text>
        <Text style={styles.url} numberOfLines={2} selectable>
          {apiBaseUrl.trim() || 'Not configured'}
        </Text>
        <Pressable style={styles.btn} onPress={() => void ping()}>
          {checking ? (
            <ActivityIndicator color="#0a0e18" />
          ) : (
            <Text style={styles.btnTxt}>Test connection</Text>
          )}
        </Pressable>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>

      <Pressable
        style={styles.link}
        onPress={() => navigation.getParent()?.navigate('AdminLogin' as never)}
      >
        <Text style={styles.linkTxt}>Admin setup (admin / admin)</Text>
      </Pressable>

      <Text style={styles.hint}>
        Upload videos from your computer: open{' '}
        <Text style={styles.mono} selectable>
          {apiBaseUrl.trim() ? `${apiBaseUrl.replace(/\/+$/, '')}/admin.html` : 'YOUR_SERVER/admin.html'}
        </Text>{' '}
        in a browser and sign in with the same admin credentials.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  url: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnTxt: {
    color: '#0a0e18',
    fontWeight: '700',
    fontSize: 15,
  },
  status: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 13,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
  },
  linkTxt: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 28,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'monospace',
    color: colors.text,
    fontSize: 12,
  },
});
