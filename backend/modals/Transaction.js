import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  plan: String,
  amount: Number,
  status: {
    type: String,
    default: "SUCCESS"
  },
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;