'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showForm, setShowForm] = useState(false);
  const [newCourt, setNewCourt] = useState({
    name: '',
    surface: 'artificial_grass',
    isIndoor: false,
    pricePerSlot: '',
    slotDuration: 90,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: venueData } = await api.get('/venues');
      const v = venueData.venues?.[0];
      setVenue(v);
      if (v) {
        const { data } = await api.get(`/courts?venueId=${v.id}`);
        setCourts(data);
      }
    } catch {}
    setLoading(false);
  };

  const handleEdit = (court: any) => {
    setEditId(court.id);
    setEditData({ name: court.name, pricePerSlot: court.pricePerSlot, isActive: court.isActive });
  };

  const handleSave = async (id: string) => {
    try {
      await api.patch(`/courts/${id}`, editData);
      setEditId(null);
      loadData();
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;
    try {
      await api.post('/courts', { ...newCourt, venueId: venue.id, pricePerSlot: parseFloat(newCourt.pricePerSlot) });
      setShowForm(false);
      setNewCourt({ name: '', surface: 'artificial_grass', isIndoor: false, pricePerSlot: '', slotDuration: 90 });
      loadData();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Terrains</h1>
            <p className="text-slate-400 mt-1">{courts.length} terrain(s) configuré(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Ajouter un terrain
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Nouveau terrain</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-1">Nom</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Prix par séance (TND)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newCourt.pricePerSlot}
                  onChange={(e) => setNewCourt({ ...newCourt, pricePerSlot: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Durée d'une séance (min)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newCourt.slotDuration}
                  onChange={(e) => setNewCourt({ ...newCourt, slotDuration: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isIndoor"
                  checked={newCourt.isIndoor}
                  onChange={(e) => setNewCourt({ ...newCourt, isIndoor: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="isIndoor" className="text-sm text-slate-300">Terrain couvert</label>
              </div>
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm">
                  Créer le terrain
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-20">Chargement...</div>
        ) : courts.length === 0 ? (
          <div className="text-center text-slate-400 py-20">Aucun terrain configuré</div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Terrain</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Prix</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Durée</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courts.map((court) => (
                  <tr key={court.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      {editId === court.id ? (
                        <input
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <span className="text-white font-semibold">{court.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{court.isIndoor ? 'Couvert' : 'Plein air'}</td>
                    <td className="px-6 py-4">
                      {editId === court.id ? (
                        <input
                          type="number"
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500 w-20"
                          value={editData.pricePerSlot}
                          onChange={(e) => setEditData({ ...editData, pricePerSlot: parseFloat(e.target.value) })}
                        />
                      ) : (
                        <span className="text-green-400 font-semibold">{Number(court.pricePerSlot)} TND</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{court.slotDuration} min</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${court.isActive ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                        {court.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editId === court.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(court.id)} className="text-green-400 hover:text-green-300 text-sm font-semibold">Sauvegarder</button>
                          <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-300 text-sm">Annuler</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(court)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                          Modifier
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
