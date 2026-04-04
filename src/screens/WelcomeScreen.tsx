import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppConfig } from '../context/AppConfigContext';
import { colors } from '../theme/colors';

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { apiBaseUrl } = useAppConfig();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 32 }]}>
      <View style={styles.top}>
      <View style={styles.brandRow}>
        <Text style={styles.brandGroove}>GROOVE</Text>
        <Text style={styles.brandX}>X</Text>
      </View>
      <Text style={styles.tag}>Dance & talent · streaming</Text>
      <Text style={styles.body}>
        No sign-in required. Point the app at your GrooveX server, browse tabs, and play.
      </Text>

      <Pressable
        style={styles.primary}
        onPress={() => navigation.navigate('Main' as never)}
      >
        <Text style={styles.primaryTxt}>Enter app</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate('AdminLogin' as never)}
      >
        <Text style={styles.secondaryTxt}>Admin — server URL</Text>
      </Pressable>

      </View>
      <Text style={styles.footer}>
        {apiBaseUrl.trim()
          ? `Current server:\n${apiBaseUrl}`
          : 'Tip: use Admin to set the API URL (try http://10.0.2.2:3001 for Android emulator).'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  top: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  brandGroove: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
  },
  brandX: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.accentSecondary,
    letterSpacing: 0,
  },
  tag: {
    fontSize: 15,
    color: colors.accent,
    marginTop: 10,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 24,
    lineHeight: 22,
  },
  primary: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 36,
  },
  primaryTxt: {
    color: '#0a0e18',
    fontSize: 17,
    fontWeight: '800',
  },
  secondary: {
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  secondaryTxt: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
