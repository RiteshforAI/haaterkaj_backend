import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create Product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, description, features, location, category } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    await Product.create({
      name,
      image,
      description,
      features,
      location,
      category
    });

    res.json({ success: true, message: "Product Added Successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Get All
router.get("/", async (req, res) => {
  res.json(await Product.find());
});

export default router;
