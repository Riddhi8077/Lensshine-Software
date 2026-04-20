const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

// ✅ server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});