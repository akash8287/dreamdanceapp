import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import { AuditionsTabScreen } from '../screens/AuditionsTabScreen';
import { DancesTabScreen } from '../screens/DancesTabScreen';
import { HomeTabScreen } from '../screens/HomeTabScreen';
import { MoreTabScreen } from '../screens/MoreTabScreen';
import { MyListTabScreen } from '../screens/MyListTabScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTabScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="⌂" color={color} />,
        }}
      />
      <Tab.Screen
        name="Auditions"
        component={AuditionsTabScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🎤" color={color} />,
        }}
      />
      <Tab.Screen
        name="Dances"
        component={DancesTabScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="💃" color={color} />,
        }}
      />
      <Tab.Screen
        name="MyList"
        component={MyListTabScreen}
        options={{
          tabBarLabel: 'My List',
          tabBarIcon: ({ color }) => <TabIcon icon="♡" color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreTabScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="⋯" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
