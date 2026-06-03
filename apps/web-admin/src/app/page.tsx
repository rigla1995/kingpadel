export default function AdminHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          King<span className="text-blue-400">Padel</span>
        </h1>
        <p className="text-slate-300 text-xl mb-2">Back-office Administration</p>
        <p className="text-slate-500 text-sm mb-8">Accès restreint — Administrateurs uniquement</p>
        <a
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all"
        >
          Accéder au dashboard
        </a>
      </div>
    </main>
  );
}
