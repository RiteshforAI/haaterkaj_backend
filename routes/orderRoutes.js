// routes/orderRoutes.js
import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import auth from "../middleware/auth.js";

// ✅ Make sure .env is loaded here too
dotenv.config();



const router = express.Router();

// ✅ Initialize Razorpay safely


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

 

// ✅ Verify payment route


export default router;


