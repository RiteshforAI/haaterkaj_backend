import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      qty: Number
    }
  ],
  shippingAddress: { type: Object, required: true },
  totalAmount: Number,
  paymentStatus: { type: String, default: "pending" },
  paymentDetails: { type: Object }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
