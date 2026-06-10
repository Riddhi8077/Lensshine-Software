const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders by mobile
router.get("/:mobile", async (req, res) => {
  try {
    const mobile = String(req.params.mobile || "").replace(/\D/g, "");
    const orders = await Order.find({ mobile: { $regex: `^${mobile}$` } }).sort({ createdAt: -1 });
    const customer =
      orders.length > 0
        ? {
            full_name: orders[0].customer_name,
            mobile: orders[0].mobile,
            address: orders[0].address,
          }
        : null;
    res.json({ customer, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE order
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      mobile,
      address,
      email,
      booking_date,
      prescription,

      // Legacy fields
      frame_price,
      lens_name,
      lens_price,

      // New fields
      items,

      // Totals/payment
      total_amount,
      paid_amount,
      remaining_amount,
      payment_status,
      discount,
    } = req.body;



    const normalizedMobile = String(mobile || "").replace(/\D/g, "");

    if (!customer_name || !normalizedMobile || total_amount === undefined) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // If items[] exists, compute totals from items for safety + set legacy totals.
    let computedTotal = total_amount;
    let computedDiscount = discount || 0;

    if (Array.isArray(items) && items.length > 0) {
      computedTotal = items.reduce(
        (sum, it) => sum + (Number(it.item_total) || 0),
        0
      );
      computedDiscount = items.reduce(
        (sum, it) => sum + (Number(it.bogo_discount) || 0),
        0
      );
    }


    const order = new Order({
      customer_name,
      mobile: normalizedMobile,
      address,
      email,
      booking_date,
      prescription,

      // Keep legacy fields populated if client sends them.
      frame_price: frame_price || 0,
      lens_name: lens_name || "",
      lens_price: lens_price || 0,

      // Feature 5/6
      items: Array.isArray(items) ? items : undefined,

      total_amount: Number(computedTotal) || 0,
      paid_amount: paid_amount || 0,
      remaining_amount:
        typeof remaining_amount === "number" ? remaining_amount : Number(computedTotal) || 0,
      payment_status: payment_status || "pending",
      discount: Number(computedDiscount) || 0,
    });

    await order.save();

    console.log("✅ Order saved:", {
      id: order._id,
      customer_name: order.customer_name,
      mobile: order.mobile,
      total_amount: order.total_amount,
    });

    res.status(201).json({
      id: order._id,
      ...order.toObject(),
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE payment
router.patch("/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $push: {
          payments: { amount, method, date: new Date() },
        },
        $inc: { paid_amount: amount },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.remaining_amount = Math.max(0, order.total_amount - order.paid_amount);
    order.payment_status = order.remaining_amount <= 0 ? "paid" : "partial";
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

