import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppConfig } from '../context/AppConfigContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AdminConfig'>;

export function AdminConfigScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { apiBaseUrl, setApiBaseUrl } = useAppConfig();
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  async function onSave() {
    const t = url.trim().replace(/\/+$/, '');
    setSaving(true);
    try {
      await setApiBaseUrl(t);
      Alert.alert('Saved', 'API base URL updated.', [
        { text: 'OK', onPress: () => navigation.navigate('Welcome') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.title}>GrooveX server</Text>
      <Text style={styles.sub}>
        Base URL only — no path. Examples:{'\n'}
        • EC2 (real phone): http://16.171.47.190:3001{'\n'}
        • Android emulator → same machine: http://10.0.2.2:3001{'\n'}
        • Railway / HTTPS: https://your-app.up.railway.app
      </Text>

      <Text style={styles.label}>API base URL</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://16.171.47.190:3001"
        placeholderTextColor={colors.textMuted}
      />

      <Pressable
        style={[styles.primaryBtn, saving && styles.btnDisabled]}
        onPress={() => void onSave()}
        disabled={saving}
      >
        <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
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
    color: colors.accent,
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
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
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#0a0e18',
    fontSize: 17,
    fontWeight: '800',
  },
});
