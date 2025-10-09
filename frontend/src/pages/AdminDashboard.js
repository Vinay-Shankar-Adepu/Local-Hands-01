import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { VerificationAPI } from "../services/api";
import { FiShield, FiUsers, FiArrowRightCircle } from "react-icons/fi";

const data = [
  { name: "Mon", bookings: 8 },
  { name: "Tue", bookings: 12 },
  { name: "Wed", bookings: 10 },
  { name: "Thu", bookings: 14 },
  { name: "Fri", bookings: 18 },
  { name: "Sat", bookings: 22 },
  { name: "Sun", bookings: 16 },
];

export default function AdminDashboard() {
  const [catalog, setCatalog] = useState([]);
  const [catName, setCatName] = useState("");
  const [newTpl, setNewTpl] = useState({ name: "", category: "", defaultPrice: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerifications, setPendingVerifications] = useState(0);

  const navigate = useNavigate();

  const loadCatalog = async () => {
    try {
      const { data } = await API.get("/catalog");
      setCatalog(data.catalog || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load catalog");
    }
  };

  const loadVerifications = async () => {
    try {
      const { data } = await VerificationAPI.listPending();
      setPendingVerifications(data.data?.length || 0);
    } catch (e) {
      console.error("Failed to fetch verification stats");
    }
  };

  useEffect(() => {
    loadCatalog();
    loadVerifications();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      setLoading(true);
      setError("");
      await API.post("/admin/categories", { name: catName });
      setCatName("");
      loadCatalog();
    } catch (e) {
      setError(e?.response?.data?.message || "Add category failed");
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (e) => {
    e.preventDefault();
    if (!newTpl.name || !newTpl.category) return;
    try {
      setLoading(true);
      setError("");
      const categoryObj = catalog.find((c) => c.name === newTpl.category);
      if (!categoryObj) {
        setError("Category not found");
        setLoading(false);
        return;
      }
      await API.post("/admin/templates", {
        name: newTpl.name,
        category: categoryObj._id,
        defaultPrice: Number(newTpl.defaultPrice) || 0,
      });
      setNewTpl({ name: "", category: "", defaultPrice: "" });
      loadCatalog();
    } catch (e) {
      setError(e?.response?.data?.message || "Add service failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>

        {/* Analytics Section */}
        <section className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Weekly Bookings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card dark:shadow-none border border-transparent dark:border-gray-700 lg:col-span-2 transition-colors">
            <h2 className="font-semibold">Weekly Bookings</h2>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" strokeWidth={3} stroke="#2563eb" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Add + Verification Card */}
          <div className="space-y-6">
            {/* Quick Add Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card dark:shadow-none border border-transparent dark:border-gray-700 transition-colors">
              <h2 className="font-semibold">Quick Add</h2>
              <form onSubmit={addCategory} className="mt-4 flex gap-2">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="New Category"
                  className="border rounded-lg px-3 py-2 text-sm flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  Add
                </button>
              </form>

              <form onSubmit={addTemplate} className="mt-4 space-y-2">
                <input
                  value={newTpl.name}
                  onChange={(e) => setNewTpl({ ...newTpl, name: e.target.value })}
                  placeholder="Service Name"
                  className="border rounded-lg px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={newTpl.category}
                  onChange={(e) => setNewTpl({ ...newTpl, category: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Category</option>
                  {catalog.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  value={newTpl.defaultPrice}
                  onChange={(e) => setNewTpl({ ...newTpl, defaultPrice: e.target.value })}
                  placeholder="Default Price"
                  type="number"
                  className="border rounded-lg px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                <button
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm w-full transition-colors disabled:opacity-60"
                >
                  Add Service Template
                </button>
              </form>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
            </div>

            {/* 🔹 Verification Summary Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card dark:shadow-none border border-transparent dark:border-gray-700 transition-all hover:shadow-md cursor-pointer"
                 onClick={() => navigate("/admin/verifications")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <FiShield className="text-indigo-600 dark:text-indigo-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Verification Requests</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending provider approvals</p>
                  </div>
                </div>
                <FiArrowRightCircle className="text-gray-400 text-2xl" />
              </div>

              <div className="mt-4 flex items-end justify-between">
                <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{pendingVerifications}</h2>
                <span className="text-sm text-gray-500">pending</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Catalog Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Catalog (Active)</h2>
          <button
            onClick={loadCatalog}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {catalog.length === 0 ? (
          <div className="p-10 border border-dashed rounded-xl text-center text-sm text-gray-500">
            No categories yet. Add one above.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((cat) => (
              <div
                key={cat._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-none border border-transparent dark:border-gray-700 p-5 flex flex-col transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{cat.name}</h3>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {cat.services.length} svc
                  </span>
                </div>
                <ul className="space-y-1 mb-4 text-xs text-gray-600 dark:text-gray-300 flex-1 overflow-auto max-h-40 pr-1">
                  {cat.services.map((s) => (
                    <li key={s._id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        ₹{s.defaultPrice}
                      </span>
                    </li>
                  ))}
                  {cat.services.length === 0 && <li className="italic opacity-60">No services</li>}
                </ul>
                <button
                  onClick={() => setNewTpl((t) => ({ ...t, category: cat.name }))}
                  className="mt-auto text-xs text-blue-600 underline self-start hover:text-blue-700"
                >
                  Add Service Here
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
