const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.get("/stats", async (req, res) => {
  try {
    const { period } = req.query;
    let dateFilter = {};

    if (period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: today } };
    } else if (period === "month") {
      const firstDay = new Date();
      firstDay.setDate(1);
      firstDay.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: firstDay } };
    }

    const orders = await Order.find(dateFilter);

    const stats = {
      total_orders: orders.length,
      total_earned: orders.reduce((sum, o) => sum + (o.paid_amount || 0), 0),
      total_billed: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pending_amount: orders.reduce(
        (sum, o) => sum + (o.remaining_amount || 0),
        0
      ),
      paid_orders: orders.filter((o) => o.payment_status === "paid").length,
      partial_orders: orders.filter((o) => o.payment_status === "partial").length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
