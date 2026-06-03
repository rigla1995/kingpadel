'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '@/lib/api';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  PRO: 'Pro',
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'PUBLIC',
    maxPlayers: 8,
    startDate: '',
    endDate: '',
    price: 0,
    requiredLevel: '',
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
        const { data } = await api.get(`/events?venueId=${v.id}`);
        setEvents(data.events || []);
      }
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;
    try {
      const payload: any = {
        ...newEvent,
        venueId: venue.id,
        price: parseFloat(String(newEvent.price)),
        maxPlayers: parseInt(String(newEvent.maxPlayers)),
      };
      if (!payload.requiredLevel) delete payload.requiredLevel;
      await api.post('/events', payload);
      setShowForm(false);
      loadData();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Événements</h1>
            <p className="text-slate-400 mt-1">{events.length} événement(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Créer un événement
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Nouvel événement</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-1">Titre</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 h-20 resize-none"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Type</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Privé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Niveau requis (optionnel)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.requiredLevel}
                  onChange={(e) => setNewEvent({ ...newEvent, requiredLevel: e.target.value })}
                >
                  <option value="">Tous niveaux</option>
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="ADVANCED">Avancé</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Max joueurs</label>
                <input
                  type="number"
                  min="2"
                  max="64"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.maxPlayers}
                  onChange={(e) => setNewEvent({ ...newEvent, maxPlayers: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Prix (TND)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Date de début</label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Date de fin</label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm">
                  Créer
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-20">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-slate-400 py-20">Aucun événement créé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <div key={event.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex-1 mr-2">{event.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${event.type === 'PUBLIC' ? 'bg-green-950 text-green-400' : 'bg-purple-950 text-purple-400'}`}>
                    {event.type === 'PUBLIC' ? 'Public' : 'Privé'}
                  </span>
                </div>
                {event.description && (
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                )}
                {event.requiredLevel && (
                  <p className="text-xs text-yellow-400 mb-3">Niveau: {LEVEL_LABELS[event.requiredLevel]}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-300">{format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}</p>
                    <p className="text-slate-500">
                      {format(new Date(event.startDate), 'HH:mm')} – {format(new Date(event.endDate), 'HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{event._count?.participants ?? 0}/{event.maxPlayers}</p>
                    <p className="text-slate-500">participants</p>
                  </div>
                </div>
                {event.price > 0 && (
                  <p className="text-green-400 font-semibold mt-3">{Number(event.price)} TND</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
