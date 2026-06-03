import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#22c55e',
  CANCELLED: '#ef4444',
  COMPLETED: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

export default function ReservationsScreen() {
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    loadVenues();
    loadMyReservations();
  }, []);

  useEffect(() => {
    if (selectedCourt) loadSlots();
  }, [selectedCourt, selectedDate]);

  const loadVenues = async () => {
    try {
      const { data } = await api.get('/venues');
      setVenues(data.venues || []);
    } catch {}
  };

  const loadMyReservations = async () => {
    try {
      const { data } = await api.get('/reservations/my');
      setMyReservations(data);
    } catch {}
  };

  const loadSlots = async () => {
    if (!selectedCourt) return;
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await api.get(`/courts/${selectedCourt.id}/availability?date=${dateStr}`);
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReserve = async (slot: any) => {
    if (!selectedCourt) return;
    setLoading(true);
    try {
      await api.post('/reservations', {
        courtId: selectedCourt.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      Alert.alert('Succès', 'Réservation créée avec succès!');
      loadSlots();
      loadMyReservations();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de réserver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Réserver un terrain</Text>
        </View>

        {/* Venue selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un club</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {venues.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.venueCard, selectedVenue?.id === v.id && styles.selectedCard]}
                onPress={() => { setSelectedVenue(v); setSelectedCourt(null); setSlots([]); }}
              >
                {v.isSponsored && <Text style={styles.sponsoredBadge}>⭐ Sponsorisé</Text>}
                <Text style={styles.venueName}>{v.name}</Text>
                <Text style={styles.venueCity}>{v.city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Court selector */}
        {selectedVenue && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un terrain</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {(selectedVenue.courts || []).map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.courtCard, selectedCourt?.id === c.id && styles.selectedCard]}
                  onPress={() => setSelectedCourt(c)}
                >
                  <Text style={styles.courtName}>{c.name}</Text>
                  <Text style={styles.courtPrice}>{Number(c.pricePerSlot)} TND/séance</Text>
                  <Text style={styles.courtInfo}>{c.isIndoor ? 'Couvert' : 'Plein air'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date selector */}
        {selectedCourt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir une date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.toISOString()}
                  style={[styles.dateCard, format(selectedDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd') && styles.selectedCard]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={styles.dateDayName}>{format(d, 'EEE', { locale: fr })}</Text>
                  <Text style={styles.dateDay}>{format(d, 'dd')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Slots */}
        {selectedCourt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
            {slotsLoading ? (
              <ActivityIndicator color="#22c55e" style={{ marginTop: 16 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.emptyText}>Aucun créneau disponible</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotCard, !slot.available && styles.slotUnavailable]}
                    disabled={!slot.available || loading}
                    onPress={() => handleReserve(slot)}
                  >
                    <Text style={[styles.slotTime, !slot.available && styles.slotTimeUnavailable]}>
                      {format(new Date(slot.startTime), 'HH:mm')}
                    </Text>
                    <Text style={styles.slotEndTime}>
                      {format(new Date(slot.endTime), 'HH:mm')}
                    </Text>
                    {slot.available ? (
                      <Text style={styles.slotAvailable}>Réserver</Text>
                    ) : (
                      <Text style={styles.slotTaken}>Pris</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* My Reservations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes réservations</Text>
          {myReservations.length === 0 ? (
            <Text style={styles.emptyText}>Aucune réservation</Text>
          ) : (
            myReservations.slice(0, 5).map((r: any) => (
              <View key={r.id} style={styles.reservationCard}>
                <View style={styles.reservationRow}>
                  <Text style={styles.reservationVenue}>{r.court?.venue?.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[r.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] }]}>
                      {STATUS_LABELS[r.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reservationCourt}>{r.court?.name}</Text>
                <Text style={styles.reservationTime}>
                  {format(new Date(r.startTime), 'dd MMM yyyy — HH:mm', { locale: fr })} →{' '}
                  {format(new Date(r.endTime), 'HH:mm')}
                </Text>
                <Text style={styles.reservationPrice}>{Number(r.totalPrice)} TND</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#f9fafb' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#d1d5db', marginBottom: 12 },
  hList: { paddingRight: 20, gap: 10 },
  venueCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 150,
  },
  selectedCard: { borderColor: '#22c55e', backgroundColor: '#052e16' },
  sponsoredBadge: { fontSize: 10, color: '#f59e0b', marginBottom: 4 },
  venueName: { fontSize: 15, fontWeight: '700', color: '#f9fafb' },
  venueCity: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  courtCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 130,
  },
  courtName: { fontSize: 14, fontWeight: '600', color: '#f9fafb' },
  courtPrice: { fontSize: 13, color: '#22c55e', marginTop: 4, fontWeight: '600' },
  courtInfo: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  dateCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    minWidth: 56,
  },
  dateDayName: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' },
  dateDay: { fontSize: 20, fontWeight: '700', color: '#f9fafb' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotCard: {
    backgroundColor: '#052e16',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#166534',
    width: '30%',
    alignItems: 'center',
  },
  slotUnavailable: { backgroundColor: '#1f2937', borderColor: '#374151' },
  slotTime: { fontSize: 15, fontWeight: '700', color: '#22c55e' },
  slotTimeUnavailable: { color: '#6b7280' },
  slotEndTime: { fontSize: 11, color: '#9ca3af' },
  slotAvailable: { fontSize: 11, color: '#4ade80', marginTop: 4 },
  slotTaken: { fontSize: 11, color: '#ef4444', marginTop: 4 },
  reservationCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
  },
  reservationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reservationVenue: { fontSize: 16, fontWeight: '700', color: '#f9fafb' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  reservationCourt: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  reservationTime: { fontSize: 13, color: '#d1d5db', marginTop: 6 },
  reservationPrice: { fontSize: 15, fontWeight: '700', color: '#22c55e', marginTop: 6 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
