import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/auth.store';
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, reservationsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/reservations/my'),
      ]);
      setProfile(profileRes.data);
      setReservations(reservationsRes.data.filter((r: any) => r.status === 'COMPLETED').slice(0, 5));
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#22c55e" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const displayUser = profile || user;
  if (!displayUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {displayUser.avatar ? (
              <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayUser.firstName?.[0]}{displayUser.lastName?.[0]}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.fullName}>
            {displayUser.firstName} {displayUser.lastName}
          </Text>
          <Text style={styles.email}>{displayUser.email}</Text>
          {displayUser.level && (
            <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[displayUser.level] + '22' }]}>
              <Text style={[styles.levelText, { color: LEVEL_COLORS[displayUser.level] }]}>
                {LEVEL_LABELS[displayUser.level]}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayUser.eloScore || 1000}</Text>
            <Text style={styles.statLabel}>ELO</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayUser._count?.reservations ?? 0}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{displayUser._count?.lobbyParticipants ?? 0}</Text>
            <Text style={styles.statLabel}>Matchs</Text>
          </View>
        </View>

        {/* Match History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des matchs</Text>
          {reservations.length === 0 ? (
            <Text style={styles.emptyText}>Aucun match joué pour l'instant</Text>
          ) : (
            reservations.map((r: any) => (
              <View key={r.id} style={styles.matchCard}>
                <Text style={styles.matchVenue}>{r.court?.venue?.name}</Text>
                <Text style={styles.matchDate}>
                  {format(new Date(r.startTime), 'dd MMM yyyy', { locale: fr })}
                </Text>
                <Text style={styles.matchCourt}>{r.court?.name}</Text>
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Modifier mon profil</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  profileHeader: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatarContainer: { marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#052e16',
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#22c55e' },
  fullName: { fontSize: 24, fontWeight: '800', color: '#f9fafb', marginBottom: 4 },
  email: { fontSize: 14, color: '#9ca3af', marginBottom: 10 },
  levelBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  levelText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statValue: { fontSize: 26, fontWeight: '800', color: '#22c55e' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#d1d5db', marginBottom: 12 },
  matchCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  matchVenue: { fontSize: 15, fontWeight: '700', color: '#f9fafb' },
  matchDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  matchCourt: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  menuItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemText: { fontSize: 15, color: '#d1d5db' },
  menuArrow: { fontSize: 20, color: '#9ca3af' },
  logoutItem: { borderColor: '#7f1d1d', backgroundColor: '#1c0606' },
  logoutText: { fontSize: 15, color: '#ef4444', fontWeight: '600' },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
