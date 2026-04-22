import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0d1117', borderTopWidth: 0, height: 65, paddingBottom: 8 },
        tabBarActiveTintColor: '#f9c74f',
        tabBarInactiveTintColor: '#555',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tabs.Screen name="mission" options={{ title: 'Mission', tabBarIcon: () => <TabIcon emoji="🎯" /> }} />
      <Tabs.Screen name="games" options={{ title: 'Jeux', tabBarIcon: () => <TabIcon emoji="🎮" /> }} />
      <Tabs.Screen name="dinodex" options={{ title: 'Dino-Dex', tabBarIcon: () => <TabIcon emoji="🦕" /> }} />
    </Tabs>
  );
}
