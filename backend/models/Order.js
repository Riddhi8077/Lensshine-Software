const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    address: String,
    email: String,
    booking_date: Date,

    prescription: {
      type: {
        type: String,
        enum: ["manual", "image"],
      },
      image_data: String,
      right_eye: String,
      left_eye: String,
    },

    frame_price: { type: Number, default: 0 },
    lens_name: String,
    lens_price: { type: Number, default: 0 },

    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    remaining_amount: { type: Number, default: 0 },

    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    payments: [
      {
        amount: Number,
        method: String,
        date: { type: Date, default: Date.now },
      },
    ],

    invoice_url: String,
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
