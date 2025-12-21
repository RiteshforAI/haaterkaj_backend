import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: { type: Number, required: null },   // ✅ NEW FIELD
  features: { type: [String], default: [] },
  location: String,
  category: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null } // ✅ Link to seller
}, { timestamps: true
});

export default mongoose.model("Product", productSchema);
