export default function ProviderDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold">Provider Overview</h1>
      <section className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <div className="text-sm text-gray-500">Today</div>
          <div className="mt-2 text-3xl font-extrabold">0</div>
          <div className="text-gray-600">New requests</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <div className="text-sm text-gray-500">This week</div>
          <div className="mt-2 text-3xl font-extrabold">₹0</div>
          <div className="text-gray-600">Estimated earnings</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <div className="text-sm text-gray-500">Rating</div>
          <div className="mt-2 text-3xl font-extrabold">—</div>
          <div className="text-gray-600">Avg. rating</div>
        </div>
      </section>
    </div>
  );
}
