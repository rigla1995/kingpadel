import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function FeedScreen() {
  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: () => api.get('/venues').then((r) => r.data),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
          King<Text style={{ color: '#22c55e' }}>Padel</Text>
        </Text>
        <Text style={{ color: '#6b7280', marginBottom: 24 }}>Bonjour, prêt à jouer ?</Text>

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Enseignes à la une
        </Text>

        {venues?.map((venue: any) => (
          <TouchableOpacity
            key={venue.id}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#2a2a2a',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{venue.name}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>{venue.city}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
