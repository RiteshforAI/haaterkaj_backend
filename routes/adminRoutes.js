import express from "express";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import upload from "../middleware/upload.js";
import adminAuth from "../middleware/adminAuth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ================= ADMIN AUTH ================= */

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await Admin.findOne({ email });
    if (exist) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword });

    res.json({ message: "Admin registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json({ success: false, message: "No admin found" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.json({ success: false, message: "Wrong password" });

  const token = jwt.sign({ id: admin._id }, "SECRET", { expiresIn: "7d" });

  res.json({ success: true, token, admin });
});

/* ================= PRODUCTS ================= */

// ADD PRODUCT
router.post(
  "/add-product",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, place, features } = req.body;
      const image = req.file ? req.file.path : "";

      const featuresArray =
        typeof features === "string"
          ? features.split(",").map((f) => f.trim())
          : features;

      const product = await Product.create({
        name,
        description,
        place,
        features: featuresArray,
        image,
      });

      res.json({ success: true, product });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET ALL PRODUCTS
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email");
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE PRODUCT
router.delete("/product/:id", adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ================= USERS ================= */

// GET ALL USERS
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE USER
router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
