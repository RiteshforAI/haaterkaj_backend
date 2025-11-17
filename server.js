import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// ✅ Setup dirname and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// ✅ Connect to MongoDB
connectDB();

const app = express();

// ✅ Enable CORS (Allow frontend requests)
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true, // allows cookies or auth headers
  })
);

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ Import routes (after env + DB setup)
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";



// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/seller", sellerRoutes);





// ✅ Optional test route
app.get("/", (req, res) => {
  res.send("🚀 Bengal Haat API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
});

