import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../lib/api';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#22c55e',
  INTERMEDIATE: '#3b82f6',
  ADVANCED: '#f59e0b',
  PRO: '#ef4444',
};

export default function LobbyScreen() {
  const currentUser = useAuthStore((s) => s.user);
  const [openLobbies, setOpenLobbies] = useState<any[]>([]);
  const [selectedLobby, setSelectedLobby] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    loadOpenLobbies();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (selectedLobby) {
      pollRef.current = setInterval(() => refreshSelectedLobby(), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedLobby?.id]);

  const loadOpenLobbies = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get('/lobbies/open');
      setOpenLobbies(data.lobbies || []);
    } catch {
      setOpenLobbies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshSelectedLobby = async () => {
    if (!selectedLobby) return;
    try {
      const { data } = await api.get(`/lobbies/${selectedLobby.id}`);
      setSelectedLobby(data);
    } catch {}
  };

  const joinLobby = async (lobbyId: string) => {
    try {
      await api.post(`/lobbies/${lobbyId}/join`);
      Alert.alert('Succès', 'Vous avez rejoint le lobby!');
      const { data } = await api.get(`/lobbies/${lobbyId}`);
      setSelectedLobby(data);
      loadOpenLobbies();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de rejoindre');
    }
  };

  const submitScore = async () => {
    if (!selectedLobby) return;
    const players = selectedLobby.players || [];
    const scores = players.map((p: any) => ({
      userId: p.userId,
      score: scoreInputs[p.userId] || '0',
      result: resultInputs[p.userId] || 'LOSS',
    }));
    setSubmitting(true);
    try {
      await api.post(`/lobbies/${selectedLobby.id}/score`, { scores });
      Alert.alert('Succès', 'Score enregistré! ELO mis à jour.');
      refreshSelectedLobby();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de soumettre le score');
    } finally {
      setSubmitting(false);
    }
  };

  const renderLobbyDetail = () => {
    if (!selectedLobby) return null;
    const isParticipant = selectedLobby.players?.some((p: any) => p.userId === currentUser?.id);
    const isCompleted = selectedLobby.status === 'COMPLETED';

    return (
      <View style={styles.lobbyDetail}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedLobby(null)}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.detailTitle}>
          {selectedLobby.reservation?.court?.venue?.name}
        </Text>
        <Text style={styles.detailCourt}>{selectedLobby.reservation?.court?.name}</Text>

        <View style={[styles.statusBadge,
          { backgroundColor: selectedLobby.status === 'OPEN' ? '#052e16' : selectedLobby.status === 'FULL' ? '#1e1b4b' : '#1c1917' }
        ]}>
          <Text style={styles.statusText}>{selectedLobby.status}</Text>
        </View>

        <Text style={styles.playersTitle}>Joueurs ({selectedLobby.players?.length ?? 0}/4)</Text>
        {selectedLobby.players?.map((p: any) => (
          <View key={p.id} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {p.user?.firstName} {p.user?.lastName}
                {p.userId === currentUser?.id && ' (Moi)'}
              </Text>
              <Text style={styles.playerElo}>ELO: {p.user?.eloScore}</Text>
            </View>
            <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[p.user?.level] || '#6b7280' }]} />
          </View>
        ))}

        {isParticipant && !isCompleted && selectedLobby.scores?.length === 0 && (
          <View style={styles.scoreSection}>
            <Text style={styles.scoreSectionTitle}>Soumettre le score</Text>
            {selectedLobby.players?.map((p: any) => (
              <View key={p.id} style={styles.scoreRow}>
                <Text style={styles.scorePlayerName}>
                  {p.user?.firstName} {p.user?.lastName}
                </Text>
                <TextInput
                  style={styles.scoreInput}
                  value={scoreInputs[p.userId] || ''}
                  onChangeText={(v) => setScoreInputs((prev) => ({ ...prev, [p.userId]: v }))}
                  placeholder="Score"
                  placeholderTextColor="#4b5563"
                  keyboardType="default"
                />
                <View style={styles.resultBtns}>
                  {['WIN', 'LOSS'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.resultBtn,
                        resultInputs[p.userId] === r && (r === 'WIN' ? styles.resultBtnWin : styles.resultBtnLoss),
                      ]}
                      onPress={() => setResultInputs((prev) => ({ ...prev, [p.userId]: r }))}
                    >
                      <Text style={styles.resultBtnText}>{r === 'WIN' ? 'W' : 'L'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.submitScoreBtn} onPress={submitScore} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitScoreBtnText}>Valider le score</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && selectedLobby.scores?.length > 0 && (
          <View style={styles.scoreSection}>
            <Text style={styles.scoreSectionTitle}>Résultats</Text>
            {selectedLobby.scores.map((s: any) => (
              <View key={s.id} style={styles.resultRow}>
                <Text style={styles.resultPlayerName}>
                  {s.user?.firstName} {s.user?.lastName}
                </Text>
                <Text style={styles.resultScore}>{s.score}</Text>
                <Text style={[styles.resultLabel, { color: s.result === 'WIN' ? '#22c55e' : '#ef4444' }]}>
                  {s.result === 'WIN' ? 'Victoire' : 'Défaite'}
                </Text>
                <Text style={[styles.eloChange, { color: s.eloChange > 0 ? '#22c55e' : '#ef4444' }]}>
                  {s.eloChange > 0 ? `+${s.eloChange}` : s.eloChange} ELO
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (selectedLobby) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {renderLobbyDetail()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lobbies</Text>
        <Text style={styles.subtitle}>Rejoignez un match en cours</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#22c55e" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadOpenLobbies(true)} tintColor="#22c55e" />
          }
          contentContainerStyle={styles.list}
        >
          {openLobbies.length === 0 ? (
            <Text style={styles.emptyText}>Aucun lobby ouvert pour le moment</Text>
          ) : (
            openLobbies.map((lobby) => (
              <TouchableOpacity
                key={lobby.id}
                style={styles.lobbyCard}
                onPress={() => setSelectedLobby(lobby)}
              >
                <View style={styles.lobbyHeader}>
                  <Text style={styles.lobbyVenue}>{lobby.reservation?.court?.venue?.name}</Text>
                  <View style={styles.spotsIndicator}>
                    <Text style={styles.spotsText}>{lobby.players?.length ?? 0}/4</Text>
                  </View>
                </View>
                <Text style={styles.lobbyCourt}>{lobby.reservation?.court?.name}</Text>
                <View style={styles.lobbyPlayers}>
                  {lobby.players?.map((p: any) => (
                    <View key={p.id} style={styles.miniPlayer}>
                      <View style={[styles.miniAvatar, { backgroundColor: LEVEL_COLORS[p.user?.level] + '33' }]}>
                        <Text style={[styles.miniAvatarText, { color: LEVEL_COLORS[p.user?.level] }]}>
                          {p.user?.firstName?.[0]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => joinLobby(lobby.id)}
                >
                  <Text style={styles.joinBtnText}>Rejoindre</Text>
                </TouchableOpacity>
              </TouchableOpacity>
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
  title: { fontSize: 28, fontWeight: '800', color: '#f9fafb' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  list: { padding: 20, gap: 12 },
  lobbyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  lobbyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lobbyVenue: { fontSize: 16, fontWeight: '700', color: '#f9fafb' },
  spotsIndicator: { backgroundColor: '#22c55e22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  spotsText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
  lobbyCourt: { fontSize: 13, color: '#9ca3af', marginTop: 4, marginBottom: 12 },
  lobbyPlayers: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  miniPlayer: {},
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: { fontSize: 16, fontWeight: '700' },
  joinBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 40 },
  lobbyDetail: {},
  backBtn: { marginBottom: 20 },
  backBtnText: { color: '#22c55e', fontSize: 16, fontWeight: '600' },
  detailTitle: { fontSize: 22, fontWeight: '800', color: '#f9fafb' },
  detailCourt: { fontSize: 14, color: '#9ca3af', marginTop: 4, marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#d1d5db' },
  playersTitle: { fontSize: 16, fontWeight: '700', color: '#d1d5db', marginBottom: 10 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  playerInfo: {},
  playerName: { fontSize: 14, fontWeight: '600', color: '#f9fafb' },
  playerElo: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
  scoreSection: { marginTop: 24 },
  scoreSectionTitle: { fontSize: 16, fontWeight: '700', color: '#d1d5db', marginBottom: 12 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  scorePlayerName: { flex: 1, fontSize: 13, color: '#f9fafb' },
  scoreInput: {
    width: 60,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#f9fafb',
    fontSize: 14,
    textAlign: 'center',
  },
  resultBtns: { flexDirection: 'row', gap: 6 },
  resultBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBtnWin: { backgroundColor: '#052e16' },
  resultBtnLoss: { backgroundColor: '#450a0a' },
  resultBtnText: { fontSize: 13, fontWeight: '700', color: '#d1d5db' },
  submitScoreBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitScoreBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  resultPlayerName: { flex: 1, fontSize: 14, color: '#f9fafb' },
  resultScore: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  resultLabel: { fontSize: 12, fontWeight: '700' },
  eloChange: { fontSize: 13, fontWeight: '700' },
});
