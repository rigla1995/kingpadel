'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadVenues();
  }, [page]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/venues?page=${page}&limit=${limit}`);
      setVenues(data.venues || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/venues/${id}`, { isActive: !current });
      loadVenues();
    } catch {}
  };

  const handleToggleSponsored = async (id: string, current: boolean) => {
    try {
      await api.patch(`/venues/${id}`, { isSponsored: !current });
      loadVenues();
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Clubs</h1>
          <p className="text-slate-400 mt-1">{total} club(s) enregistré(s)</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Chargement...</div>
        ) : venues.length === 0 ? (
          <div className="text-center text-slate-400 py-20">Aucun club</div>
        ) : (
          <>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Club</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Ville</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Terrains</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Abonnés</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actif</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Sponsorisé</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{venue.name}</p>
                        {venue.email && <p className="text-slate-500 text-xs mt-0.5">{venue.email}</p>}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue.city}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue._count?.courts ?? 0}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{venue._count?.subscriptions ?? 0}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(venue.id, venue.isActive)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${venue.isActive ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${venue.isActive ? 'left-6' : 'left-1'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleSponsored(venue.id, venue.isSponsored)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${venue.isSponsored ? 'bg-yellow-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${venue.isSponsored ? 'left-6' : 'left-1'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/dashboard/venues/${venue.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                        >
                          Voir
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 text-sm"
                >
                  ← Précédent
                </button>
                <span className="text-slate-400 text-sm">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 text-sm"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
