import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Mon", bookings: 8 }, { name: "Tue", bookings: 12 }, { name: "Wed", bookings: 10 },
  { name: "Thu", bookings: 14 }, { name: "Fri", bookings: 18 }, { name: "Sat", bookings: 22 }, { name: "Sun", bookings: 16 },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      <section className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-card lg:col-span-2">
          <h2 className="font-semibold">Weekly bookings</h2>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h2 className="font-semibold">Stats</h2>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li>Total users: 0</li>
            <li>Providers: 0</li>
            <li>Active bookings: 0</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
