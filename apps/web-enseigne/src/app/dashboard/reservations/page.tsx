'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-950',
  CONFIRMED: 'text-green-400 bg-green-950',
  CANCELLED: 'text-red-400 bg-red-950',
  COMPLETED: 'text-slate-400 bg-slate-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { data } = await api.get('/reservations/my');
      setReservations(data);
      const groups: Record<string, any[]> = {};
      data.forEach((r: any) => {
        const dateKey = format(parseISO(r.startTime), 'yyyy-MM-dd');
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(r);
      });
      setGrouped(groups);
    } catch {}
    setLoading(false);
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.patch(`/reservations/${id}/confirm`);
      loadReservations();
    } catch {}
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Annuler cette réservation?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      loadReservations();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Réservations</h1>
          <p className="text-slate-400 mt-1">{reservations.length} réservation(s) au total</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Chargement...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-slate-400 py-20">Aucune réservation</div>
        ) : (
          <div className="space-y-8">
            {Object.keys(grouped).sort().map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {format(parseISO(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
                </h2>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Joueur</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Terrain</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Horaire</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Montant</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Statut</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[dateKey].map((r: any) => (
                        <tr key={r.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-white font-medium">
                            {r.user?.firstName || '—'} {r.user?.lastName || ''}
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">{r.court?.name}</td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {format(parseISO(r.startTime), 'HH:mm')} → {format(parseISO(r.endTime), 'HH:mm')}
                          </td>
                          <td className="px-6 py-4 text-green-400 font-semibold">{Number(r.totalPrice)} TND</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                              {STATUS_LABELS[r.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {r.status === 'PENDING' && (
                                <button
                                  onClick={() => handleConfirm(r.id)}
                                  className="text-green-400 hover:text-green-300 text-sm font-semibold"
                                >
                                  Confirmer
                                </button>
                              )}
                              {['PENDING', 'CONFIRMED'].includes(r.status) && (
                                <button
                                  onClick={() => handleCancel(r.id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Annuler
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
