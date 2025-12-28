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
  const user = useAppSelector((s) => s.auth.user);
  const sessionMode = useAppSelector((s) => s.auth.sessionMode);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

        if (menuOpen) {
          setHidden(false);
        } else if (y < 8) {
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
  }, [menuOpen]);

  const toggleLabel = useMemo(() => (isDark ? "Switch to light mode" : "Switch to dark mode"), [isDark]);

  const facebookUrl = "https://www.facebook.com/profile.php?id=61583223486613";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200 bg-white transition-transform duration-200 dark:border-neutral-800 dark:bg-black ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Exporium"
            className="h-10 w-10 rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
          />
          <span className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">EXPORIUM</span>
        </Link>

        <div className="flex items-center gap-3">
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

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>

          <nav className="hidden items-center gap-5 sm:flex">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navClass}>
              Products
            </NavLink>
            <NavLink to="/announcements" className={navClass}>
              <span className="inline-flex items-center" aria-label="Announcements" title="Announcements">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </span>
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

            {user ? (
              <>
                <NavLink to="/account/profile" className={navClass}>
                  Profile
                </NavLink>
                {user.role !== "customer" && sessionMode === "admin" ? (
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
      </div>

      <nav
        id="mobile-nav"
        className={`${menuOpen ? "block" : "hidden"} border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-black sm:hidden`}
      >
        <div className="flex flex-col gap-3">
          <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" className={navClass} onClick={() => setMenuOpen(false)}>
            Products
          </NavLink>
          <NavLink to="/announcements" className={navClass} onClick={() => setMenuOpen(false)}>
            Announcements
          </NavLink>
          <NavLink to="/wishlist" className={navClass} onClick={() => setMenuOpen(false)}>
            Wishlist
          </NavLink>
          <NavLink to="/cart" className={navClass} onClick={() => setMenuOpen(false)}>
            Cart{cartCount ? ` (${cartCount})` : ""}
          </NavLink>
          <NavLink to="/track" className={navClass} onClick={() => setMenuOpen(false)}>
            Track
          </NavLink>

          {user ? (
            <>
              <NavLink to="/account/profile" className={navClass} onClick={() => setMenuOpen(false)}>
                Profile
              </NavLink>
              {user.role !== "customer" && sessionMode === "admin" ? (
                <NavLink to="/admin" className={navClass} onClick={() => setMenuOpen(false)}>
                  Admin
                </NavLink>
              ) : (
                <NavLink to="/account/orders" className={navClass} onClick={() => setMenuOpen(false)}>
                  Orders
                </NavLink>
              )}
              <button
                className="text-left text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
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
              <NavLink to="/login" className={navClass} onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navClass} onClick={() => setMenuOpen(false)}>
                Signup
              </NavLink>
            </>
          )}

          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Facebook
          </a>
        </div>
      </nav>
    </header>
  );
}
