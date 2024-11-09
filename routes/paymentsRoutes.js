import express from "express";
import isloggedin from "../middleware/auth.login.middleware.js";
import { createOrder, verifyPayment } from "../controller/Transaction.controller.js";
const router = express.Router();
router.post('/createorder',createOrder);
router.post('/verify', verifyPayment);

export default router;