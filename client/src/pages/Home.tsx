import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

import { api } from "../api/http";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/models";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
      alt: "Premium sneaker close-up",
    },
    {
      src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1600&q=80",
      alt: "Sneakers on a clean background",
    },
    {
      src: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=80",
      alt: "Sneakers lifestyle photo",
    },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/products", { params: { sort: "newest" } });
        if (!mounted) return;
        setProducts((data.products as Product[]).slice(0, 6));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-black/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-100 via-white to-white dark:from-neutral-900 dark:via-black dark:to-black" />
        <div className="pointer-events-none absolute -top-24 right-[-120px] h-80 w-80 rounded-full bg-neutral-200/60 blur-3xl dark:bg-neutral-900/40" />
        <div className="pointer-events-none absolute -bottom-24 left-[-120px] h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-900/30" />

        <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-black/40 dark:text-neutral-300">
              Premium sneakers • Worldwide sourcing
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              Exporium
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-700 dark:text-neutral-300">
              Find authentic, premium sneakers with simple checkout, wishlist, and clear order tracking.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Shop now
              </Link>
              <Link
                to="/track"
                className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900"
              >
                Track order
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Authenticity first</div>
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Curated pairs with clear product details.</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Fast checkout</div>
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Secure checkout experience.</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">Order tracking</div>
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Timeline updates from payment to delivery.</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950">
            <Swiper
              modules={[Autoplay]}
              loop
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              className="h-64 sm:h-80 lg:h-[420px]"
            >
              {heroSlides.map((s) => (
                <SwiperSlide key={s.src}>
                  <img src={s.src} alt={s.alt} className="h-full w-full object-cover" loading="lazy" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="text-neutral-900 dark:text-white">New drops</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Fresh arrivals and limited pairs.</div>
          <div className="mt-4">
            <Link to="/products" className="text-sm text-neutral-900 hover:underline dark:text-white">
              Explore products →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="text-neutral-900 dark:text-white">Wishlist</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Save favorites and buy later.</div>
          <div className="mt-4">
            <Link to="/wishlist" className="text-sm text-neutral-900 hover:underline dark:text-white">
              View wishlist →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="text-neutral-900 dark:text-white">Need tracking?</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Use your tracking ID to see shipment events.</div>
          <div className="mt-4">
            <Link to="/track" className="text-sm text-neutral-900 hover:underline dark:text-white">
              Track an order →
            </Link>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Newest drops</h2>
          <Link to="/products" className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
