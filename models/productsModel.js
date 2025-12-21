import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: String, required: true },
  img: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }]
});

const Product = mongoose.model("Product", productSchema);
export default Product;
