import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { color, font } from '@/theme';

type T = { name: string; title: string; icon: ComponentProps<typeof Feather>['name'] };

export function AppTabs({ tabs }: { tabs: T[] }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.quiet,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: color.line },
        tabBarLabelStyle: { fontFamily: font.bodySemi, fontSize: 11 },
        sceneStyle: { backgroundColor: color.canvas },
      }}>
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color: c }) => <Feather name={t.icon} size={22} color={c} /> }} />
      ))}
    </Tabs>
  );
}
