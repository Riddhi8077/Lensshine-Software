const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    // Feature 6: add-more frames (each entry can represent one “frame+lens” request)
    frame1_name: { type: String, default: "" },
    frame1_price: { type: Number, default: 0 },

    frame2_name: { type: String, default: "" },
    frame2_price: { type: Number, default: 0 },

    // Feature 5: BOGO per item
    bogo_enabled: { type: Boolean, default: false },
    bogo_discount: { type: Number, default: 0 },

    // Lens (single lens associated with the item)
    lens_name: { type: String, default: "" },
    lens_price: { type: Number, default: 0 },

    // Pre-computed total for this item (after BOGO discount)
    item_total: { type: Number, default: 0 },
  },
  { _id: false }
);

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

    // Legacy fields (must remain compatible)
    frame_price: { type: Number, default: 0 },
    lens_name: String,
    lens_price: { type: Number, default: 0 },

    // New structure (Feature 5/6)
    items: { type: [ItemSchema], default: undefined },

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

    // Keep meaning compatible: legacy coupon discount existed.
    // We will also store total BOGO discount here for new orders.
    discount: { type: Number, default: 0 },


  },
  { timestamps: true }
);


module.exports = mongoose.model("Order", OrderSchema);

