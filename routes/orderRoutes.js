// routes/orderRoutes.js
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import auth from "../middleware/auth.js";

// ✅ Make sure .env is loaded here too
dotenv.config();

console.log("🔑 RAZORPAY_KEY_ID (in orderRoutes):", process.env.RAZORPAY_KEY_ID);

const router = express.Router();

// ✅ Initialize Razorpay safely
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing! Check your .env file.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create order route
router.post("/create", auth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    let total = 0;
    const orderItems = [];

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) return res.status(404).json({ message: "Product not found" });
      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: prod.price,
        qty: it.qty,
      });
      total += prod.price * it.qty;
    }

    const dbOrder = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount: total,
      paymentStatus: "pending",
    });
    await dbOrder.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `order_rcpt_${dbOrder._id}`,
      payment_capture: 1,
    });

    dbOrder.paymentDetails = { razorpayOrderId: razorpayOrder.id };
    await dbOrder.save();

    res.json({ orderId: dbOrder._id, razorpayOrder });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Verify payment route
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      const dbOrder = await Order.findById(orderId);
      dbOrder.paymentStatus = "paid";
      dbOrder.paymentDetails = { razorpay_payment_id, razorpay_order_id, razorpay_signature };
      await dbOrder.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
