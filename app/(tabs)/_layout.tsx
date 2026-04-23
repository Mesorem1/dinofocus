import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0d1117',
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#f9c74f',
        tabBarInactiveTintColor: '#555',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Accueil',  tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tabs.Screen name="mission"  options={{ title: 'Missions', tabBarIcon: () => <TabIcon emoji="🎯" /> }} />
      <Tabs.Screen name="games"    options={{ title: 'Jeux',     tabBarIcon: () => <TabIcon emoji="🎮" /> }} />
      <Tabs.Screen name="dinodex"  options={{ title: 'Dino-Dex', tabBarIcon: () => <TabIcon emoji="🦕" /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Réglages', tabBarIcon: () => <TabIcon emoji="⚙️" /> }} />
    </Tabs>
  );
}
