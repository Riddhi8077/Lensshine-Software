const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lensshinemathura@gmail.com",
    pass: "cghv wvzd twfo zrzw",
  },
});

// ✅ CORRECT PLACE FOR AWAIT
app.post("/send-invoice", async (req, res) => {
  try {
    const { email, imageUrl } = req.body;

    console.log("EMAIL:", email);
    console.log("IMAGE URL:", imageUrl);

    if (!email || !imageUrl) {
      return res.status(400).send("Missing data");
    }

    // ✅ await INSIDE async function
    await transporter.sendMail({
      from: "lensshinemathura@gmail.com",
      to: email,
      subject: "Your Lensshine Invoice 🧾",

      html: `
        <h2>Thank you for your purchase 👓</h2>
        <p>Your invoice is attached below.</p>
      `,

      attachments: [
        {
          filename: "invoice.png",
          path: imageUrl,
        },
      ],
    });

    res.send("Email sent successfully");
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).send("Error sending email");
  }
});

app.post("/orders", (req, res) => {
  try {
    console.log("ORDER RECEIVED:", req.body);

    // fake response (you can later connect DB)
    res.json({
      id: Date.now(),
      ...req.body,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});