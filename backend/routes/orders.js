const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders by mobile
router.get("/:mobile", async (req, res) => {
  try {
    const mobile = String(req.params.mobile || "").replace(/\D/g, "");
    const orders = await Order.find({
      mobile: { $regex: `^${mobile}$` },
    }).sort({ createdAt: -1 });
    const customer = orders.length > 0 ? {
      full_name: orders[0].customer_name,
      mobile: orders[0].mobile,
      address: orders[0].address,
    } : null;
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
      frame_price,
      lens_name,
      lens_price,
      total_amount,
      paid_amount,
      remaining_amount,
      payment_status,
      discount,
    } = req.body;

    const normalizedMobile = String(mobile || "").replace(/\D/g, "");

    if (!customer_name || !normalizedMobile || !total_amount) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const order = new Order({
      customer_name,
      mobile: normalizedMobile,
      address,
      email,
      booking_date,
      prescription,
      frame_price,
      lens_name,
      lens_price,
      total_amount,
      paid_amount: paid_amount || 0,
      remaining_amount: remaining_amount || total_amount,
      payment_status: payment_status || "pending",
      discount: discount || 0,
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
