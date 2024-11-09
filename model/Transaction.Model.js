import mongoose, { Schema } from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
    },
    ProjectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    backerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "razorpay"],
      default: "razorpay",
    },
    transactionDate: {
      type: Date,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
