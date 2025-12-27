import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { clearWishlist } from "../store/slices/wishlistSlice";

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm ${
    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
  }`;
}

type Theme = "light" | "dark";
const THEME_KEY = "exporium_theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  const [hidden, setHidden] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        if (y < 8) {
          setHidden(false);
        } else if (delta > 10 && y > 80) {
          setHidden(true);
        } else if (delta < -10) {
          setHidden(false);
        }

        lastY = y;
        raf = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggleLabel = useMemo(() => (isDark ? "Switch to light mode" : "Switch to dark mode"), [isDark]);

  const facebookUrl = "https://www.facebook.com/profile.php?id=61583223486613";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200 bg-white transition-transform duration-200 dark:border-neutral-800 dark:bg-black ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Exporium"
            className="h-10 w-10 rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
          />
          <span className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">EXPORIUM</span>
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
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
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            Facebook
          </a>

          <button
            type="button"
            aria-label={toggleLabel}
            title={toggleLabel}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="relative inline-flex h-6 w-11 items-center rounded-full border border-neutral-300 bg-neutral-200 transition-colors dark:border-neutral-700 dark:bg-neutral-800"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform dark:bg-neutral-100 ${
                isDark ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>

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
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
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
