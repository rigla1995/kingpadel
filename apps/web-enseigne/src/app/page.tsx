export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-black p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          King<span className="text-green-400">Padel</span>
        </h1>
        <p className="text-green-200 text-xl mb-8">Espace Enseigne</p>
        <a
          href="/dashboard"
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-xl transition-all"
        >
          Accéder au dashboard
        </a>
      </div>
    </main>
  );
}
