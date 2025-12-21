import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true },
  email: { type: String, unique: true },
  password: String,
}, { timestamps: true });

export default mongoose.model("Seller", sellerSchema);
