'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Stats {
  todayReservations: number;
  weekRevenue: number;
  activeCourts: number;
  subscribers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ todayReservations: 0, weekRevenue: 0, activeCourts: 0, subscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data: venueData } = await api.get('/venues');
      const myVenue = venueData.venues?.[0];
      setVenue(myVenue);

      if (myVenue) {
        const [courtsRes, subsRes, reservationsRes] = await Promise.all([
          api.get(`/courts?venueId=${myVenue.id}`),
          api.get(`/venues/${myVenue.id}/subscribers`),
          api.get('/reservations/my'),
        ]);

        const today = new Date().toDateString();
        const todayRes = reservationsRes.data.filter(
          (r: any) => new Date(r.startTime).toDateString() === today
        );

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekRevenue = reservationsRes.data
          .filter((r: any) => r.status === 'CONFIRMED' && new Date(r.startTime) >= weekAgo)
          .reduce((sum: number, r: any) => sum + Number(r.totalPrice), 0);

        setStats({
          todayReservations: todayRes.length,
          weekRevenue,
          activeCourts: courtsRes.data.filter((c: any) => c.isActive).length,
          subscribers: subsRes.data.length,
        });
      }
    } catch {}
    setLoading(false);
  };

  const statCards = [
    { label: 'Réservations Aujourd\'hui', value: stats.todayReservations, color: 'green', icon: '📅' },
    { label: 'Revenus cette semaine', value: `${stats.weekRevenue} TND`, color: 'emerald', icon: '💰' },
    { label: 'Terrains actifs', value: stats.activeCourts, color: 'teal', icon: '🎾' },
    { label: 'Abonnés', value: stats.subscribers, color: 'cyan', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">Tableau de bord</h1>
            {venue && <p className="text-slate-400 mt-1">{venue.name} · {venue.city}</p>}
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/events"
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              + Créer un événement
            </Link>
            <Link
              href="/dashboard/courts"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Gérer les terrains
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="text-3xl font-black text-green-400 mb-1">
                {loading ? '—' : card.value}
              </div>
              <div className="text-sm text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/dashboard/courts" className="group bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 p-6 transition-colors">
            <div className="text-2xl mb-3">🎾</div>
            <h3 className="text-lg font-bold text-white mb-1">Terrains</h3>
            <p className="text-slate-400 text-sm">Gérer vos terrains, horaires et tarifs</p>
          </Link>
          <Link href="/dashboard/reservations" className="group bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 p-6 transition-colors">
            <div className="text-2xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-white mb-1">Réservations</h3>
            <p className="text-slate-400 text-sm">Confirmer et gérer les réservations</p>
          </Link>
          <Link href="/dashboard/events" className="group bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 p-6 transition-colors">
            <div className="text-2xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-white mb-1">Événements</h3>
            <p className="text-slate-400 text-sm">Créer et suivre vos événements</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
