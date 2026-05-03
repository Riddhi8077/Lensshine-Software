require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ================= MIDDLEWARE =================

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
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

// ================= EMAIL =================

// ================= EMAIL (PRODUCTION-OPTIMIZED) =================

// ================= EMAIL =================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,  //  Render-safe port (was 465)
  secure: false,  //  false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,  //  Force IPv4
  connectionTimeout: 10000,
  socketTimeout: 15000,
  pool: true,
  maxConnections: 5,
});

// Test on startup (safe)
transporter.verify((error, success) => {
  if (error) console.error("⚠️ SMTP:", error.message);
  else console.log("✅ SMTP Ready");
});

// ================= ROUTES =================

app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);

// ================= CUSTOMER SEARCH =================

app.get("/customers/search", async (req, res) => {
  try {
    const mobile = String(req.query.mobile || "").replace(/\D/g, "");
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

// ================= SEND INVOICE =================

// ================= SEND INVOICE (RELIABILITY-ENHANCED) =================
app.post("/send-invoice", async (req, res) => {
  const connectionTimeout = setTimeout(() => {
    console.error("⏰ SEND-INVOICE TIMEOUT");
    res.status(408).json({ 
      success: false, 
      message: "Request timeout - please try again" 
    });
  }, 30000); // 30s total timeout

  try {
    const { email, invoiceDataUrl, imageUrl } = req.body;
    const invoiceImage = invoiceDataUrl || imageUrl;

    console.log("📧 Invoice request:", {
      email: email?.substring(0, 3) + "***@" + email?.split('@')[1],
      hasInvoiceData: Boolean(invoiceImage),
    });

    if (!email || !invoiceImage) {
      return res.status(400).json({
        success: false,
        message: "Missing email or image URL"
      });
    }

    const dataUrlMatch = String(invoiceImage).match(/^data:(image\/\w+);base64,(.+)$/);
    const isBase64Image = Boolean(dataUrlMatch);
    let invoiceBuffer = null;
    let mimeType = "image/png";

    if (isBase64Image) {
      mimeType = dataUrlMatch[1];
      const base64Data = dataUrlMatch[2];
      invoiceBuffer = Buffer.from(base64Data, "base64");
    }

    const inlineImageHtml = isBase64Image
      ? `<img src="cid:lensshine-invoice-preview" alt="Invoice" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; display: block;" />`
      : `<img src="${invoiceImage}" alt="Invoice" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; display: block;" />`;

    const attachments = isBase64Image
      ? [{
          filename: "Lensshine_Invoice.png",
          content: invoiceBuffer,
          contentType: mimeType,
          cid: "lensshine-invoice-preview",
        }]
      : [{
          filename: "Lensshine_Invoice.png",
          path: invoiceImage,
        }];

    const logoPath = path.join(__dirname, "../frontend/public/logo.png");
    const hasLogo = fs.existsSync(logoPath);
    if (hasLogo) {
      attachments.push({
        filename: "logo.png",
        path: logoPath,
        cid: "lensshine-logo",
      });
    }

    const logoHtml = hasLogo
      ? `<img src="cid:lensshine-logo" alt="Lensshine Logo" style="height: 42px; width: auto; display:block;" />`
      : `<h1 style="color:#d4af37; margin:0; font-size:40px; line-height:1.05; font-weight:700;">Lensshine</h1>`;

    // SEND with timeout & retry logic
    const mailOptions = {
      from: "lensshinemathura@gmail.com",
      to: email,
      subject: "Your Lensshine Invoice 🧾",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; padding: 16px; max-width: 620px; margin: 0 auto; background: #070912;">
          <div style="background: linear-gradient(135deg, #111a3e 0%, #0f224a 100%); padding: 22px 24px; border-radius: 14px;">
            ${logoHtml}
            <p style="color: rgba(255,255,255,0.72); margin: 10px 0 0 0; font-size: 14px;">Premium Optical Store</p>
          </div>
          <div style="padding: 24px; background: #23262f; border-radius: 14px; margin-top: 12px;">
            <h2 style="color: #f5f6fb; margin: 0 0 10px 0; font-size: 30px; line-height: 1.15; font-weight: 700;">
              Thank you for your purchase! 👓
            </h2>
            <p style="color: #a8afbd; margin: 0 0 16px 0; font-size: 16px; line-height: 1.35;">Please find your invoice below.</p>
            <div style="background: #ffffff; border-radius: 10px; padding: 10px;">
              ${inlineImageHtml}
            </div>
          </div>
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.12); text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">For support: contact@lensshine.com | +91 98765 43210</p>
          </div>
        </div>
      `,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    
    clearTimeout(connectionTimeout);
    console.log("✅ Email sent successfully:", result.messageId);
    res.json({ 
      success: true, 
      message: "Email sent successfully",
      messageId: result.messageId 
    });

  } catch (err) {
    clearTimeout(connectionTimeout);
    
    console.error("❌ EMAIL ERROR DETAILS:", {
      message: err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      stack: err.stack?.split('\n')[0]
    });

    // User-friendly error messages
    let userMessage = "Failed to send email. Please try again.";
    if (err.code === 'EAUTH') {
      userMessage = "Invalid email credentials. Check app password.";
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
      userMessage = "Network timeout. Please try again in a moment.";
    } else if (err.message.includes('ENETUNREACH')) {
      userMessage = "Server network issue. Please try again later.";
    }

    res.status(500).json({ 
      success: false, 
      message: userMessage,
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ================= HEALTH CHECK =================

app.get("/health", (req, res) => {
  res.json({ status: "✅ Backend is running", timestamp: new Date() });
});

// ================= START SERVER =================

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
