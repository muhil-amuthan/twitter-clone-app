import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// In-memory OTP store (email -> otp)
const otpStore = new Map();

/**
 * 📩 SEND OTP
 * POST /otp/send
 */
router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, otp);

    // Mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Audio Tweet OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Audio Tweet OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    // Auto-expire OTP
    setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/**
 * ✅ VERIFY OTP
 * POST /otp/verify
 */
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const storedOtp = otpStore.get(email);

  if (String(storedOtp) !== String(otp)) {
    return res.status(400).json({ verified: false, message: "Invalid OTP" });
  }

  otpStore.delete(email);
  res.json({ verified: true });
});

export default router;