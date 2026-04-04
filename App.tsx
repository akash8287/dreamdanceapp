import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppConfigProvider, useAppConfig } from './src/context/AppConfigContext';
import { MainTabs } from './src/navigation/MainTabs';
import type { RootStackParamList } from './src/navigation/types';
import { AdminConfigScreen } from './src/screens/AdminConfigScreen';
import { AdminLoginScreen } from './src/screens/AdminLoginScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { loaded, apiBaseUrl } = useAppConfig();

  if (!loaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={apiBaseUrl.trim() ? 'Main' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminConfig" component={AdminConfigScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppConfigProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AppConfigProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
