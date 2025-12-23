import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, "SECRET");
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default adminAuth;
