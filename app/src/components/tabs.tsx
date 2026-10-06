import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { color, font } from '@/theme';
import { Text } from '@/components/Text';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type TabDef = { name: string; title: string; icon: IconName; badge?: number };

// Bottom menu from the wireframes (P4, S3 nav): white bar, icon in a tinted pill when active, 11px label underneath.
function TabBar({ state, descriptors, navigation, defs }: BottomTabBarProps & { defs: TabDef[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.bar, { paddingBottom: Math.max(insets.bottom, 22) }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const def = defs.find((d) => d.name === route.name);
        if (!def) return null;
        const on = state.index === i;
        const press = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!on && !e.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={descriptors[route.key].options.title ?? def.title} onPress={press} style={st.item}>
            <View style={[st.iconPill, on && st.iconPillOn]}>
              <Icon name={def.icon} size={24} tint={on ? color.primary : color.quiet} />
              {def.badge ? (
                <View style={st.badge}>
                  <Text style={st.badgeText}>{def.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[st.label, on && st.labelOn]}>{def.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AppTabs({ tabs }: { tabs: TabDef[] }) {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.canvas } }} tabBar={(p) => <TabBar {...p} defs={tabs} />}>
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: color.line, paddingTop: 8, paddingHorizontal: 6 },
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconPill: { paddingHorizontal: 16, paddingVertical: 3, borderRadius: 999 },
  iconPillOn: { backgroundColor: color.primaryTint },
  label: { fontFamily: font.bodyMedium, fontSize: 11, color: color.quiet },
  labelOn: { fontFamily: font.bodyBold, color: color.primary },
  // 18 px red badge at top -3 / left 50% + 4 with a 2 px white ring outside it (the ring is drawn as a border here).
  badge: { position: 'absolute', top: -5, left: '50%', marginLeft: 2, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: color.bad, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: '#FFFFFF' },
  badgeText: { fontFamily: font.bodyBold, fontSize: 11, color: '#FFFFFF' },
});
