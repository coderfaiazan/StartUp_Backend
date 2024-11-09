import AppError from "../utils/error.utils.js";
import Transaction from "../model/Transaction.Model.js";
const transactionmodel = Transaction;
import User from "../model/User.Model.js";
const usermodel = User;
import Project from "../model/Project.Model.js";
const projectmodel = Project;
import { razorpay } from "../server.js";
import crypto from "crypto";
import axios from "axios";
const createOrder = async (req, res, next) => {
  const { userId, projectId, amount } = req.body;
  if (!userId || !projectId || !amount) {
    return next(new AppError("All fields are required", 400));
  }
  const user = await usermodel.findById(userId);
  if (!user) {
    return next(new AppError("Unauthorized User, please login", 400));
  }
  const project = await projectmodel.findById(projectId);
  if (!project) {
    return next(new AppError("Project does not exist", 400));
  }
  const options = {
    amount: Number(amount) * 100, // amount in smallest currency unit
    currency: "INR",
    receipt: `order_${userId.slice(0, 10)}_${projectId.slice(0, 10)}`, // Shortened receipt
  };
  try {
    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
};

// Verify Payment Function
const verifyPayment = async (req, res, next) => {
  const { userId, projectId, order_id, payment_id, signature, amount } =
    req.body;

  if (!userId || !projectId || !order_id || !payment_id || !signature) {
    return next(new AppError("Missing required fields", 400));
  }

  const user = await usermodel.findById(userId);
  if (!user) {
    return next(new AppError("Unauthorized User, please login", 400));
  }

  const project = await projectmodel.findById(projectId);
  if (!project) {
    return next(new AppError("Project does not exist", 400));
  }

  const secret_key = process.env.RAZORPAY_SECRET;
  const hmac = crypto.createHmac("sha256", secret_key);
  hmac.update(order_id + "|" + payment_id);

  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === signature) {
    try {
      // Create a new transaction
      const transaction = new transactionmodel({
        order_id,
        ProjectId: projectId,
        backerId: userId,
        amount,
        paymentStatus: "completed",
        transactionDate: new Date(),
      });
      await transaction.save();

      // Update project and user records
      project.amountRaised += amount;
      project.transactions.push(transaction._id);
      project.backers.push(userId);
      await project.save();

      user.backedProjects.push({ projectId, amount });
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified and transaction recorded",
      });
    } catch (error) {
      return next(new AppError("Transaction failed", 500));
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  }
};

export { createOrder, verifyPayment };
