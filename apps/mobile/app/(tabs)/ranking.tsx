import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#3b82f6',
  ADVANCED: '#f59e0b',
  PRO: '#ef4444',
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'DÉB',
  INTERMEDIATE: 'INT',
  ADVANCED: 'AVA',
  PRO: 'PRO',
};

const RANK_EMOJIS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export default function RankingScreen() {
  const currentUser = useAuthStore((s) => s.user);
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get('/users/ranking?limit=50');
      setPlayers(data.players || []);
      setTotal(data.total || 0);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = currentUser?.id === item.id;

    return (
      <View style={[styles.playerRow, isCurrentUser && styles.currentUserRow]}>
        <View style={styles.rankContainer}>
          {rank <= 3 ? (
            <Text style={styles.rankEmoji}>{RANK_EMOJIS[rank]}</Text>
          ) : (
            <Text style={styles.rankNumber}>#{rank}</Text>
          )}
        </View>

        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isCurrentUser && styles.currentUserName]}>
            {item.firstName} {item.lastName}
            {isCurrentUser && ' (Moi)'}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] + '22' }]}>
            <Text style={[styles.levelText, { color: LEVEL_COLORS[item.level] }]}>
              {LEVEL_LABELS[item.level]}
            </Text>
          </View>
        </View>

        <View style={styles.eloContainer}>
          <Text style={[styles.eloScore, isCurrentUser && styles.currentUserElo]}>
            {item.eloScore}
          </Text>
          <Text style={styles.eloLabel}>ELO</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Classement</Text>
        <Text style={styles.subtitle}>{total} joueurs inscrits</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#22c55e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadRanking(true)} tintColor="#22c55e" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun joueur classé</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#f9fafb' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  currentUserRow: { borderColor: '#22c55e', backgroundColor: '#052e16' },
  rankContainer: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 22 },
  rankNumber: { fontSize: 15, fontWeight: '700', color: '#9ca3af' },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#22c55e' },
  playerInfo: { flex: 1, gap: 4 },
  playerName: { fontSize: 15, fontWeight: '600', color: '#f9fafb' },
  currentUserName: { color: '#4ade80' },
  levelBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: '700' },
  eloContainer: { alignItems: 'flex-end' },
  eloScore: { fontSize: 20, fontWeight: '800', color: '#f9fafb' },
  currentUserElo: { color: '#22c55e' },
  eloLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 40 },
});
