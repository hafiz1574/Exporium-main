import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { clearWishlist } from "../store/slices/wishlistSlice";

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm ${isActive ? "text-white" : "text-neutral-300 hover:text-white"}`;
}

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <header className="border-b border-neutral-800 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-wide">
          EXPORIUM
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>
          <NavLink to="/wishlist" className={navClass}>
            Wishlist
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            Cart{cartCount ? ` (${cartCount})` : ""}
          </NavLink>
          <NavLink to="/track" className={navClass}>
            Track
          </NavLink>

          {user ? (
            <>
              {user.role === "admin" ? (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              ) : (
                <NavLink to="/account/orders" className={navClass}>
                  Orders
                </NavLink>
              )}
              <button
                className="text-sm text-neutral-300 hover:text-white"
                onClick={() => {
                  dispatch(logout());
                  dispatch(clearWishlist());
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navClass}>
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
