import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../lib/api';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#3b82f6',
  ADVANCED: '#f59e0b',
  PRO: '#ef4444',
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  PRO: 'Pro',
};

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const loadEvents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get(`/events?type=${activeTab}`);
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoin = async (eventId: string) => {
    try {
      await api.post(`/events/${eventId}/join`);
      Alert.alert('Succès', 'Vous êtes inscrit à l\'événement!');
      loadEvents();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de rejoindre');
    }
  };

  const handleLeave = async (eventId: string) => {
    Alert.alert('Confirmation', 'Quitter cet événement?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/events/${eventId}/leave`);
            Alert.alert('Succès', 'Vous avez quitté l\'événement');
            loadEvents();
          } catch {}
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Événements</Text>
        <View style={styles.tabs}>
          {(['PUBLIC', 'PRIVATE'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'PUBLIC' ? 'Publics' : 'Privés'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#22c55e" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadEvents(true)} tintColor="#22c55e" />}
          contentContainerStyle={styles.list}
        >
          {events.length === 0 ? (
            <Text style={styles.emptyText}>Aucun événement disponible</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.requiredLevel && (
                    <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[event.requiredLevel] + '22' }]}>
                      <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[event.requiredLevel] }]}>
                        {LEVEL_LABELS[event.requiredLevel]}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.venueName}>{event.venue?.name} · {event.venue?.city}</Text>

                <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.dateText}>
                      {format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}
                    </Text>
                    <Text style={styles.timeText}>
                      {format(new Date(event.startDate), 'HH:mm')} — {format(new Date(event.endDate), 'HH:mm')}
                    </Text>
                  </View>
                  <View style={styles.rightInfo}>
                    <Text style={styles.spotsText}>
                      {event._count?.participants ?? 0}/{event.maxPlayers} joueurs
                    </Text>
                    {event.price > 0 && (
                      <Text style={styles.priceText}>{Number(event.price)} TND</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => handleJoin(event.id)}
                >
                  <Text style={styles.joinBtnText}>Rejoindre</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#f9fafb', marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#22c55e' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#fff' },
  list: { padding: 20, gap: 14 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  eventTitle: { fontSize: 17, fontWeight: '700', color: '#f9fafb', flex: 1, marginRight: 8 },
  levelBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { fontSize: 11, fontWeight: '700' },
  venueName: { fontSize: 13, color: '#22c55e', marginBottom: 8, fontWeight: '500' },
  eventDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  dateText: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  timeText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rightInfo: { alignItems: 'flex-end' },
  spotsText: { fontSize: 13, color: '#9ca3af' },
  priceText: { fontSize: 15, fontWeight: '700', color: '#22c55e', marginTop: 2 },
  joinBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 40 },
});
