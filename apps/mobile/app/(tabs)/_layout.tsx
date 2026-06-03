import { Tabs } from 'expo-router';
import { Home, Calendar, Trophy, User, Bell, Users } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{ title: 'Accueil', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ title: 'Réserver', tabBarIcon: ({ color }) => <Calendar size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: 'Événements', tabBarIcon: ({ color }) => <Bell size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="lobby"
        options={{ title: 'Lobbies', tabBarIcon: ({ color }) => <Users size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Classement', tabBarIcon: ({ color }) => <Trophy size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
      />
    </Tabs>
  );
}
