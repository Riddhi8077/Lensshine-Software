import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Phone,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
} from "lucide-react";

import { API } from "../App";

function CustomerHistory() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleSearch = async () => {
    if (mobile.trim().length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await axios.get(`${API}/customers/${mobile.trim()}/orders`);
      setCustomer(res.data.customer);
      setOrders(res.data.orders || []);

      if (res.data.orders?.length === 0 && !res.data.customer) {
        toast.info("No records found for this number");
      }
    } catch (err) {
      toast.error("Search failed");
      setCustomer(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (s) => {
    if (s === "paid") return "text-green-400";
    if (s === "partial") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Customer History
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Search orders by mobile number
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              placeholder="Enter mobile number..."
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-[#141414] border border-white/10 text-white pl-10 h-12 px-3 outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#d4af37] text-black px-6 h-12"
          >
            <Search className="h-4 w-4 inline mr-2" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Customer Info */}
        {customer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-[#141414] border border-white/10 p-5 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <User className="text-[#d4af37]" />
                  <div>
                    <p className="text-white">{customer.full_name}</p>
                    <p className="text-white/50 text-sm">
                      {customer.mobile} {customer.address && `• ${customer.address}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/new-customer")}
                  className="bg-[#d4af37] text-black px-3 py-1 text-sm"
                >
                  New Order
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders */}
        <AnimatePresence>
          {orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="bg-[#141414] border border-white/10">

                    <button
                      className="w-full p-4 flex justify-between"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                    >
                      <div>
                        <p className="text-white text-sm">
                          {order.lens_name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {order.booking_date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[#d4af37]">
                          ₹{order.total_amount}
                        </p>
                        <p className={statusStyle(order.payment_status)}>
                          {order.payment_status}
                        </p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-white/10 text-sm text-white/70">
                        Frame: ₹{order.frame_price} <br />
                        Lens: ₹{order.lens_price} <br />
                        Paid: ₹{order.paid_amount} <br />
                        Remaining: ₹{order.remaining_amount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Empty */}
        {searched && !loading && orders.length === 0 && !customer && (
          <div className="text-center py-16">
            <Clock className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40">
              No records found
            </p>

            <button
              onClick={() => navigate("/new-customer")}
              className="mt-4 bg-[#d4af37] text-black px-4 py-2"
            >
              Create New Customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerHistory;