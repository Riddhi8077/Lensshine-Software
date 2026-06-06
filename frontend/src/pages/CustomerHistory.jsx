import React, { useState, useCallback, useEffect } from "react";
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

import { API } from "../config/api";

function CustomerHistory() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const runSearch = useCallback(async (mobileInput) => {
    if (mobileInput.trim().length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await axios.get(`${API}/orders/${mobileInput.trim()}`);
      setCustomer(res.data.customer);
      setOrders(res.data.orders || []);

      if (res.data.orders?.length === 0 && !res.data.customer) {
        toast.info("No records found for this number");
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      toast.error("Search failed");
      setCustomer(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => runSearch(mobile);

  useEffect(() => {
    if (!searched || mobile.trim().length < 10) return;
    const intervalId = setInterval(() => runSearch(mobile), 10000);
    return () => clearInterval(intervalId);
  }, [mobile, searched, runSearch]);

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
                const isExpanded = expandedOrder === order._id;

                return (
                  <div key={order._id} className="bg-[#141414] border border-white/10">

                    <button
                      className="w-full p-4 flex justify-between"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order._id)
                      }
                    >
                      <div>
                        <p className="text-white text-sm">
                          {order.lens_name || "Lens"}
                        </p>
                        <p className="text-white/40 text-xs">
                          {order.booking_date ? new Date(order.booking_date).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[#d4af37]">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </p>
                        <p className={statusStyle(order.payment_status)}>
                          {order.payment_status}
                        </p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-white/10 text-sm text-white/70 space-y-1">
                        <p><strong className="text-white">Frame:</strong> ₹{Number(order.frame_price).toLocaleString()}</p>
                        <p><strong className="text-white">Lens:</strong> ₹{Number(order.lens_price).toLocaleString()}</p>
                        <p><strong className="text-white">Paid:</strong> <span className="text-green-400">₹{Number(order.paid_amount).toLocaleString()}</span></p>
                        <p><strong className="text-white">Remaining:</strong> <span className="text-amber-400">₹{Number(order.remaining_amount).toLocaleString()}</span></p>

                        <div className="pt-3">
                          <button
                            onClick={() => {
                              // Client-side invoice regeneration (no new PDF library)
                              (async () => {
                                try {
                                  const htmlToImage = await import("html-to-image");

                                  const container = document.createElement("div");
                                  container.style.position = "absolute";
                                  container.style.left = "-9999px";
                                  container.style.top = "0";
                                  container.style.width = "700px";

                                  container.innerHTML = `
                                    <div style="background:#fff; border-radius:12px; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                                      <div style="background: linear-gradient(to right, #0f172a, #334155, #0f172a); padding:18px 24px;">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                          <div>
                                            <div style="font-weight:800; color:#fff; font-size:18px;">Lensshine</div>
                                            <div style="color: rgba(255,255,255,0.65); font-size:12px; margin-top:2px;">Premium Optical Store</div>
                                          </div>
                                          <div style="text-align:right;">
                                            <div style="color: rgba(255,255,255,0.7); font-size:12px;">INVOICE</div>
                                            <div style="color:#fff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,'Liberation Mono','Courier New',monospace; font-size:12px; margin-top:2px;">
                                              #${String(order._id).slice(0, 8) || "----"}
                                            </div>
                                            <div style="color: rgba(255,255,255,0.65); font-size:12px; margin-top:4px;">
                                              ${order.booking_date ? new Date(order.booking_date).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div style="padding:24px;">
                                        <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px;">
                                          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                            <div style="width:10px; height:10px; background:#d4af37; border-radius:999px;"></div>
                                            <div style="color:#64748b; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;">Customer Information</div>
                                          </div>
                                          <div style="color:#0f172a; font-weight:700;">${order.customer_name || "N/A"}</div>
                                          <div style="color:#334155; font-size:14px; margin-top:2px;">${order.mobile || "N/A"}</div>
                                          ${order.address ? `<div style="color:#64748b; font-size:14px; margin-top:6px;">${order.address}</div>` : ""}
                                        </div>

                                        <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:16px;">
                                          <table style="width:100%; border-collapse:collapse;">
                                            <thead>
                                              <tr style="background:#f1f5f9;">
                                                <th style="text-align:left; padding:12px 16px; color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Product</th>
                                                <th style="text-align:center; padding:12px 16px; color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Qty</th>
                                                <th style="text-align:right; padding:12px 16px; color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Price</th>
                                                <th style="text-align:right; padding:12px 16px; color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Total</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr style="border-top:1px solid #e2e8f0;">
                                                <td style="padding:12px 16px; color:#0f172a;">Frame</td>
                                                <td style="padding:12px 16px; text-align:center; color:#64748b;">1</td>
                                                <td style="padding:12px 16px; text-align:right; color:#64748b;">₹${Number(order.frame_price || 0).toLocaleString()}</td>
                                                <td style="padding:12px 16px; text-align:right; color:#0f172a; font-weight:500;">₹${Number(order.frame_price || 0).toLocaleString()}</td>
                                              </tr>
                                              <tr style="border-top:1px solid #e2e8f0;">
                                                <td style="padding:12px 16px; color:#0f172a;">${order.lens_name || "Lens"}</td>
                                                <td style="padding:12px 16px; text-align:center; color:#64748b;">1</td>
                                                <td style="padding:12px 16px; text-align:right; color:#64748b;">₹${Number(order.lens_price || 0).toLocaleString()}</td>
                                                <td style="padding:12px 16px; text-align:right; color:#0f172a; font-weight:500;">₹${Number(order.lens_price || 0).toLocaleString()}</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>

                                        <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px;">
                                          <div style="display:flex; justify-content:space-between; font-size:14px;">
                                            <span style="color:#64748b;">Subtotal</span>
                                            <span style="color:#0f172a;">₹${Number(order.total_amount || 0).toLocaleString()}</span>
                                          </div>
                                          <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:6px;">
                                            <span style="color:#16a34a;">Paid</span>
                                            <span style="color:#16a34a; font-weight:600;">₹${Number(order.paid_amount || 0).toLocaleString()}</span>
                                          </div>
                                          <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:6px;">
                                            <span style="color:#f59e0b;">Remaining</span>
                                            <span style="color:#f59e0b; font-weight:600;">₹${Number(order.remaining_amount || 0).toLocaleString()}</span>
                                          </div>
                                          <div style="border-top:1px solid #cbd5e1; padding-top:8px; margin-top:8px; display:flex; justify-content:space-between;">
                                            <span style="color:#0f172a; font-weight:700;">Grand Total</span>
                                            <span style="color:#d4af37; font-weight:800; font-size:18px;">₹${Number(order.total_amount || 0).toLocaleString()}</span>
                                          </div>
                                        </div>

                                        <div style="text-align:center; padding-top:10px; border-top:1px solid #e2e8f0;">
                                          <div style="color:#64748b; font-size:14px; font-weight:500;">Thank you for your business!</div>
                                          <div style="color:#94a3b8; font-size:12px; margin-top:4px;">For support: lensshinemathura@gmail.com | +91 79067 20813</div>
                                        </div>
                                      </div>
                                    </div>
                                  `;

                                  container.querySelectorAll("img").forEach((img) => (img.decoding = "async"));
                                  document.body.appendChild(container);

                                  const target = container.querySelector("div[style*='background:#fff']") || container.firstElementChild;
                                  if (!target || !(target instanceof Element)) {
                                    // Let html-to-image throw naturally if something is still wrong
                                    throw new Error("Invoice render element not found");
                                  }
                                  const blob = await htmlToImage.toBlob(target, {
                                    cacheBust: true,
                                    pixelRatio: 2,
                                    backgroundColor: "#ffffff",
                                    skipFonts: true,
                                  });

                                  if (!blob) throw new Error("Failed to generate invoice image");

                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `Lensshine_Invoice_${String(order._id).slice(0, 6).toUpperCase()}.png`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  URL.revokeObjectURL(url);

                                  document.body.removeChild(container);
                                  toast.success("Invoice downloaded");
                                } catch (e) {
                                  console.error(e);
                                  toast.error("Failed to download invoice");
                                }
                              })();
                            }}
                            className="mt-2 w-full bg-[#d4af37] text-black px-4 py-2 text-sm rounded-lg hover:bg-[#f3e5ab] transition-colors"
                          >
                            Download Invoice
                          </button>
                        </div>
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