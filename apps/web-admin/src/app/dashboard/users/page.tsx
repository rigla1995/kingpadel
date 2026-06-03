'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const ROLE_COLORS: Record<string, string> = {
  PLAYER: 'text-green-400 bg-green-950',
  VENUE_MANAGER: 'text-blue-400 bg-blue-950',
  ADMIN: 'text-red-400 bg-red-950',
};

const ROLE_LABELS: Record<string, string> = {
  PLAYER: 'Joueur',
  VENUE_MANAGER: 'Enseigne',
  ADMIN: 'Admin',
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'text-green-400',
  INTERMEDIATE: 'text-blue-400',
  ADVANCED: 'text-yellow-400',
  PRO: 'text-red-400',
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  PRO: 'Pro',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/ranking?page=${page}&limit=${limit}`);
      setUsers(data.players || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Utilisateurs</h1>
            <p className="text-slate-400 mt-1">{total} utilisateurs inscrits</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Chargement...</div>
        ) : (
          <>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">#</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Joueur</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Niveau</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">ELO</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Rôle</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => (
                    <tr key={user.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        #{(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-blue-400">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${LEVEL_COLORS[user.level]}`}>
                          {LEVEL_LABELS[user.level]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-400 font-bold">{user.eloScore}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || 'text-slate-400 bg-slate-800'}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-red-400 hover:text-red-300 text-sm font-semibold">
                          Suspendre
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
