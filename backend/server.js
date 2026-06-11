require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5175/",
  "https://lensshinesoftware.netlify.app"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests with no origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked for origin:", origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false
      );
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lensshinemathura@gmail.com",
    pass: "cghv wvzd twfo zrzw",
  },
});


app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);


app.get("/customers/search", async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile) {
      return res.json([]);
    }

    const Order = require("./models/Order");
    const orders = await Order.find({ mobile }).limit(1);

    if (orders.length > 0) {
      res.json([{
        full_name: orders[0].customer_name,
        mobile: orders[0].mobile,
        address: orders[0].address,
      }]);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("❌ SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});


app.post("/send-invoice", async (req, res) => {
  try {
    const { email, imageUrl } = req.body;

    console.log("📧 Invoice request:", { email, imageUrl: imageUrl?.substring(0, 50) + "..." });

    if (!email || !imageUrl) {
      console.error("❌ Missing email or imageUrl");
      return res.status(400).json({
        success: false,
        message: "Missing email or image URL"
      });
    }

    await transporter.sendMail({
      from: "lensshinemathura@gmail.com",
      to: email,
      subject: "Your Lensshine Invoice 🧾",

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 12px;">
            <h1 style="color: #d4af37; margin: 0;">Lens<span style="color: #d4af37;">shine</span></h1>
            <p style="color: #fff;">Premium Optical Store</p>
          </div>
          <div style="padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 15px;">
            <h2 style="color: #333;">Thank you for your purchase! 👓</h2>
            <p style="color: #666;">Please find your invoice below.</p>
            <img src="${imageUrl}" alt="Invoice" style="max-width: 100%; border-radius: 8px; margin-top: 15px;" />
          </div>
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px;">For support: contact@lensshine.com | +91 98765 43210</p>
          </div>
        </div>
      `,

      attachments: [
        {
          filename: "Lensshine_Invoice.png",
          path: imageUrl,
        },
      ],
    });

    console.log("✅ Email sent successfully to:", email);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    res.status(500).json({ success: false, message: "Error sending email: " + err.message });
  }
});


app.get("/health", (req, res) => {
  res.json({ status: "✅ Backend is running", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log("📊 API Ready:");
      console.log("   POST   /orders              (Create order)");
      console.log("   GET    /orders              (Get all orders)");
      console.log("   GET    /orders/:mobile      (Get customer orders)");
      console.log("   GET    /dashboard/stats     (Dashboard stats)");
      console.log("   GET    /customers/search    (Search customer)");
      console.log("   POST   /send-invoice        (Email invoice)");
      console.log("   GET    /health              (Health check)\n");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
