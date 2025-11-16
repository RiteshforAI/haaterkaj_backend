import express from "express";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";


const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email,phone, password } = req.body;

  const exist = await Seller.findOne({ email });
  if (exist) return res.json({ success: false, message: "Seller already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const seller = await Seller.create({ name, email,phone, password: hashed });

  res.json({ success: true, message: "Seller registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email });

  if (!seller) return res.json({ success: false, message: "No seller found" });

  const match = await bcrypt.compare(password, seller.password);
  if (!match) return res.json({ success: false, message: "Wrong password" });

  const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: "7d" });


  res.json({ success: true, token, seller });
});

// ADD PRODUCT
router.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    const { name, description, place, price, features, sellerId } = req.body;

    const product = await Product.create({
      name,
      description,
      place,
      price,
      features: features.split(",").map(f => f.trim()),
      image: req.file ? `/uploads/${req.file.filename}` : "",
      seller: sellerId,
    });

    res.json({ success: true, product });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
 // GET PRODUCTS OF LOGGED IN SELLER
router.get("/my-products/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ seller: sellerId });
    res.json({ success: true, products });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find({seller: { $ne: null }})
     .populate("seller", "name phone");
    res.json({ success: true, products });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
router.get("/admin-products", async (req, res) => {
  try {
    const products = await Product.find({ seller: null }); // admin-added only
    res.json({ success: true, products });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id
    });

    if (!product) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


router.put("/update/:id", auth, async (req, res) => {
  try {
    const { name, description, features, price, place } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, description, features, price, place });
    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await Seller.findByIdAndUpdate(req.user.id, { name, phone });
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get("/my-products", auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });

    res.json({
      success: true,
      products
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ GET SINGLE PRODUCT BY ID
router.get("/product/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Optional: Check ownership (only seller can access)
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to access this product" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
// ✅ Get Logged-in Seller Info
router.get("/me", auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    res.json({ success: true, seller });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await Seller.findByIdAndUpdate(req.user.id, { name, phone });
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


export default router;
