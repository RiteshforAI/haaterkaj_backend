import { Navigate } from "react-router-dom";

export default function SellerPrivateRoute({ children }) {
  const token = localStorage.getItem("sellerToken");

  return token ? children : <Navigate to="/seller/login" />;
}
