import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Cart } from "./pages/Cart";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { ProductDetails } from "./pages/ProductDetails";
import { Products } from "./pages/Products";
import { Signup } from "./pages/Signup";
import { Track } from "./pages/Track";
import { VerifyEmail } from "./pages/VerifyEmail";
import { VerifyEmailSent } from "./pages/VerifyEmailSent";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Wishlist } from "./pages/Wishlist";
import { Employees } from "./pages/Employees";
import { Announcements } from "./pages/Announcements";
import { AccountOrderDetails } from "./pages/account/OrderDetails";
import { AccountOrders } from "./pages/account/Orders";
import { AccountProfile } from "./pages/account/Profile";
import { AdminCustomers } from "./pages/admin/CustomersAdmin";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminAnnouncements } from "./pages/admin/AnnouncementsAdmin";
import { AdminOrders } from "./pages/admin/OrdersAdmin";
import { AdminProducts } from "./pages/admin/ProductsAdmin";
import { AdminUsers } from "./pages/admin/UsersAdmin";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe } from "./store/slices/authSlice";
import { fetchWishlist } from "./store/slices/wishlistSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [dispatch, token, user]);

  useEffect(() => {
    if (token) dispatch(fetchWishlist());
  }, [dispatch, token]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track" element={<Track />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/sent" element={<VerifyEmailSent />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/announcements" element={<Announcements />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account/profile" element={<AccountProfile />} />
          <Route path="/account/orders" element={<AccountOrders />} />
          <Route path="/account/orders/:id" element={<AccountOrderDetails />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "owner", "manager", "editor"]} requireAdminMode />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
        </Route>

        <Route element={<ProtectedRoute roles={["owner"]} requireAdminMode />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
