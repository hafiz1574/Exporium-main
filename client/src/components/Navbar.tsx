import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { api } from "../api/http";
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

  const [activeAnnouncementsCount, setActiveAnnouncementsCount] = useState(0);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [announcementsStatus, setAnnouncementsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Array<{ _id: string; title: string; message: string; createdAt: string }>>([]);
  const announcementsPopoverRef = useRef<HTMLDivElement | null>(null);
  const announcementsPopoverMobileRef = useRef<HTMLDivElement | null>(null);

  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/announcements");
        const count = Array.isArray(data?.announcements) ? data.announcements.length : 0;
        if (mounted) setActiveAnnouncementsCount(count);
      } catch {
        // Non-critical; avoid showing noisy errors in the navbar.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!announcementsOpen) return;
      const desktopPopover = announcementsPopoverRef.current;
      const mobilePopover = announcementsPopoverMobileRef.current;
      const targetIsOutsideDesktop = desktopPopover ? e.target instanceof Node && !desktopPopover.contains(e.target) : true;
      const targetIsOutsideMobile = mobilePopover ? e.target instanceof Node && !mobilePopover.contains(e.target) : true;

      if (targetIsOutsideDesktop && targetIsOutsideMobile) {
        setAnnouncementsOpen(false);
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [announcementsOpen]);

  async function loadAnnouncements() {
    setAnnouncementsStatus("loading");
    setAnnouncementsError(null);
    try {
      const { data } = await api.get("/api/announcements");
      const items = Array.isArray(data?.announcements) ? data.announcements : [];
      setAnnouncements(items);
      setAnnouncementsStatus("idle");
    } catch (err: any) {
      setAnnouncementsStatus("error");
      setAnnouncementsError(err?.response?.data?.error ?? err?.message ?? "Failed to load announcements");
    }
  }

  async function openAnnouncements() {
    setAnnouncementsOpen(true);
    if (announcementsStatus === "error" || announcements.length === 0) {
      await loadAnnouncements();
    }
  }

  async function toggleAnnouncements() {
    if (announcementsOpen) {
      setAnnouncementsOpen(false);
      return;
    }
    await openAnnouncements();
  }

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
      <div className="flex w-full items-center justify-between px-4 py-3 sm:py-4">
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
            <div className="flex items-center gap-5">
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
            </div>

            <div className="relative ml-2 flex items-center gap-5 border-l border-neutral-200 pl-3 dark:border-neutral-800">
              <button
                type="button"
                className={navClass({ isActive: announcementsOpen })}
                onClick={() => void toggleAnnouncements()}
                aria-label="Announcements"
                title="Announcements"
                aria-expanded={announcementsOpen}
                aria-controls="announcements-popover"
              >
                <span className="relative inline-flex items-center">
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
                  {activeAnnouncementsCount > 0 ? (
                    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-neutral-900 px-1 text-[10px] leading-4 text-white dark:bg-white dark:text-black">
                      {activeAnnouncementsCount}
                    </span>
                  ) : null}
                </span>
              </button>

              {announcementsOpen ? (
                <div
                  id="announcements-popover"
                  ref={announcementsPopoverRef}
                  className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[85vw] rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-black"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">Announcements</div>
                    <button
                      type="button"
                      className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                      onClick={() => setAnnouncementsOpen(false)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-3 max-h-80 overflow-auto">
                    {announcementsStatus === "loading" ? (
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
                    ) : null}
                    {announcementsStatus === "error" ? (
                      <div className="text-sm text-red-600 dark:text-red-400">{announcementsError}</div>
                    ) : null}

                    {announcementsStatus === "idle" ? (
                      <div className="space-y-2">
                        {announcements.map((a) => (
                          <div
                            key={a._id}
                            className="rounded-lg border border-neutral-200 bg-white/70 p-3 dark:border-neutral-800 dark:bg-neutral-950/40"
                          >
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">{a.title}</div>
                            <div className="mt-1 max-h-16 overflow-hidden whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                              {a.message}
                            </div>
                            <div className="mt-2 text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                        {announcements.length === 0 ? (
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">No announcements</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

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
            </div>
          </nav>
        </div>
      </div>

      {announcementsOpen ? (
        <div
          ref={announcementsPopoverMobileRef}
          className="fixed left-4 right-4 top-20 z-50 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-black sm:hidden"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">Announcements</div>
            <button
              type="button"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              onClick={() => setAnnouncementsOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-3 max-h-[60vh] overflow-auto">
            {announcementsStatus === "loading" ? (
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
            ) : null}
            {announcementsStatus === "error" ? (
              <div className="text-sm text-red-600 dark:text-red-400">{announcementsError}</div>
            ) : null}

            {announcementsStatus === "idle" ? (
              <div className="space-y-2">
                {announcements.map((a) => (
                  <div
                    key={a._id}
                    className="rounded-lg border border-neutral-200 bg-white/70 p-3 dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{a.title}</div>
                    <div className="mt-1 max-h-24 overflow-hidden whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                      {a.message}
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                ))}
                {announcements.length === 0 ? (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">No announcements</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
          <button
            type="button"
            className="text-left text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            onClick={() => {
              setMenuOpen(false);
              void openAnnouncements();
            }}
          >
            Announcements{activeAnnouncementsCount ? ` (${activeAnnouncementsCount})` : ""}
          </button>
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
