'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalReservations: 0,
    totalRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, venuesRes] = await Promise.all([
        api.get('/users/ranking?limit=100'),
        api.get('/venues?limit=100'),
      ]);

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalVenues: venuesRes.data.total || 0,
        totalReservations: 0,
        totalRevenue: 0,
      });

      setRecentActivity(venuesRes.data.venues?.slice(0, 5) || []);
    } catch {}
    setLoading(false);
  };

  const kpiCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: 'blue', href: '/dashboard/users' },
    { label: 'Clubs', value: stats.totalVenues, icon: '🏟️', color: 'indigo', href: '/dashboard/venues' },
    { label: 'Réservations du mois', value: stats.totalReservations, icon: '📅', color: 'violet', href: '/dashboard/venues' },
    { label: 'Revenus', value: `${stats.totalRevenue} TND`, icon: '💰', color: 'blue', href: '/dashboard/venues' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">Administration</h1>
            <p className="text-slate-400 mt-1">Vue globale de la plateforme KingPadel</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {kpiCards.map((card) => (
            <Link key={card.label} href={card.href} className="group">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-blue-800 transition-colors">
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className="text-3xl font-black text-blue-400 mb-1">
                  {loading ? '—' : card.value}
                </div>
                <div className="text-sm text-slate-400">{card.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <Link href="/dashboard/users" className="bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 p-6 transition-colors">
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-lg font-bold text-white mb-1">Gestion des utilisateurs</h3>
            <p className="text-slate-400 text-sm">Voir, chercher et gérer les comptes joueurs</p>
          </Link>
          <Link href="/dashboard/venues" className="bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 p-6 transition-colors">
            <div className="text-2xl mb-3">🏟️</div>
            <h3 className="text-lg font-bold text-white mb-1">Gestion des clubs</h3>
            <p className="text-slate-400 text-sm">Activer, désactiver, passer en sponsorisé</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Activité récente — Clubs</h2>
          {recentActivity.length === 0 ? (
            <div className="text-slate-400 text-sm">Aucune activité récente</div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Club</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Ville</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Terrains</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Abonnés</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((venue: any) => (
                    <tr key={venue.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-white font-medium">{venue.name}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue.city}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue._count?.courts ?? 0}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue._count?.subscriptions ?? 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${venue.isActive ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                          {venue.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
