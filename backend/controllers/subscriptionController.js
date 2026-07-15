import Subscription from "../modals/Subscription.js";
import Transaction from "../modals/Transaction.js";
import User from "../modals/user.js";
import { v4 as uuidv4 } from "uuid";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendInvoiceMail } from "../utils/sendInvoiceMail.js";

const plans = {
  BRONZE: { limit: 3, price: 100, duration: 30 },
  SILVER: { limit: 5, price: 300, duration: 30 },
  GOLD: { limit: -1, price: 1000, duration: 30 }
};

export const subscribePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    // ✅ 1️⃣ TIME RESTRICTION (10AM–11AM IST)
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const hour = istTime.getHours();

    if (hour !== 10) {
      return res.status(403).json({
        msg: "Payments allowed only between 10AM to 11AM IST"
      });
    }

    // ✅ 2️⃣ VALIDATE PLAN
    const selected = plans[plan];

    if (!selected) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    // ✅ 3️⃣ CREATE TRANSACTION (Simulated PG)
    const txnId = uuidv4();

    await Transaction.create({
      userId,
      plan,
      amount: selected.price,
      transactionId: txnId,
      status: "SUCCESS"
    });

    // ✅ 4️⃣ CALCULATE EXPIRY
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selected.duration);

    // ✅ 5️⃣ ACTIVATE SUBSCRIPTION
    await Subscription.findOneAndUpdate(
      { userId },
      {
        plan,
        tweetLimit: selected.limit,
        tweetsUsed: 0,
        status: "ACTIVE",
        startDate: new Date(),
        endDate
      },
      { upsert: true, new: true }
    );

    // ✅ 6️⃣ GENERATE INVOICE PDF
    const invoicePath = generateInvoice(
      userId,
      plan,
      selected.price,
      txnId
    );

    // ✅ 7️⃣ SEND EMAIL WITH INVOICE
    const user = await User.findById(userId);

    if (user && user.email) {
      await sendInvoiceMail(user.email, invoicePath);
    }

    // ✅ 8️⃣ RESPONSE
    return res.status(200).json({
      msg: "Plan Activated Successfully",
      transactionId: txnId
    });

  } catch (err) {
    console.error("Subscription Error:", err.message);

    return res.status(500).json({
      msg: "Subscription Failed",
      error: err.message
    });
  }
};