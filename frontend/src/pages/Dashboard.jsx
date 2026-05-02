import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ShoppingBag, IndianRupee, Clock, AlertTriangle, BookDashed } from "lucide-react";

import { API } from "../config/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats?period=${period}`),
          axios.get(`${API}/orders`),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        console.log("✅ Dashboard data loaded:", statsRes.data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }, [period]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-white/50 text-sm">
              Overview of your shop performance
            </p>
          </div>

          {/* Period Filter */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#141414] text-white border border-white/10 px-3 py-2"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="today">Today</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Orders"
            value={stats?.total_orders || 0}
            icon={<ShoppingBag />}
          />
          <StatCard
            label="Total Earnings"
            value={`₹${stats?.total_earned || 0}`}
            icon={<IndianRupee />}
          />
          <StatCard
            label="Total Billed"
            value={`₹${stats?.total_billed || 0}`}
            icon={<IndianRupee />}
          />
          <StatCard
            label="Pending"
            value={`₹${stats?.pending_amount || 0}`}
            icon={<AlertTriangle />}
          />
        </div>

        {/* Orders Table */}
        <div className="bg-[#141414] border border-white/10">

          <div className="p-4 border-b border-white/10">
            <h3 className="text-white/60 text-sm">Recent Orders</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="p-3 text-left">Order ID</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Lens</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Paid</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-white/30">
                      Loading...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-white/30">
                      <Clock className="mx-auto mb-2 opacity-30" />
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-white/5 hover:bg-white/5"
                    >
                      <td className="p-3">#{String(order._id).slice(0, 6).toUpperCase()}</td>
                      <td className="p-3">{order.customer_name}</td>
                      <td className="p-3">{order.mobile}</td>
                      <td className="p-3">{order.lens_name || "—"}</td>
                      <td className="p-3">₹{Number(order.total_amount).toLocaleString()}</td>
                      <td className="p-3 text-green-400">
                        ₹{Number(order.paid_amount).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.payment_status === "paid" ? "bg-green-500/20 text-green-400" :
                          order.payment_status === "partial" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-3 text-white/40">
                        {order.booking_date ? new Date(order.booking_date).toLocaleDateString() : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small reusable card */
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[#141414] border border-white/10 p-4">
      <div className="flex justify-between mb-2 text-white/50 text-sm">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="text-xl font-semibold text-[#d4af37]">{value}</p>
    </div>
  );
}

export default Dashboard;