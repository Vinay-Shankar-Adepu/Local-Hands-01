import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold">Welcome, {user?.name || "Customer"} 👋</h1>

      <section className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h2 className="font-semibold">Upcoming bookings</h2>
          <p className="text-gray-600 mt-2">You have no upcoming bookings.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h2 className="font-semibold">Recommended for you</h2>
          <p className="text-gray-600 mt-2">We’ll show personalized picks here.</p>
        </div>
      </section>
    </div>
  );
}
