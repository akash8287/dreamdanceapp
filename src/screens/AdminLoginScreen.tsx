import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../constants/adminAuth';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AdminLogin'>;

export function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit() {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      navigation.navigate('AdminConfig');
      setPassword('');
      return;
    }
    Alert.alert('Login failed', 'Invalid admin credentials.');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={styles.titleRow}>
        <Text style={styles.titleGroove}>GROOVE</Text>
        <Text style={styles.titleX}>X</Text>
        <Text style={styles.titleSuffix}> admin</Text>
      </View>
      <Text style={styles.sub}>
        Default credentials: admin / admin. Unauthenticated API; this gate is
        only for changing the server URL in the app.
      </Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="admin"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••"
        placeholderTextColor={colors.textMuted}
      />

      <Pressable style={styles.primaryBtn} onPress={onSubmit}>
        <Text style={styles.primaryBtnText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    color: colors.accentSecondary,
    fontSize: 17,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  titleGroove: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  titleX: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accentSecondary,
  },
  titleSuffix: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnText: {
    color: '#0a0e18',
    fontSize: 17,
    fontWeight: '800',
  },
});
