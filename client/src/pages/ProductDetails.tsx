import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/http";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart } from "../store/slices/cartSlice";
import { addWishlist, removeWishlist } from "../store/slices/wishlistSlice";
import type { Product } from "../types/models";
import { formatMoney } from "../utils/format";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { token } = useAppSelector((s) => s.auth);
  const wishlist = useAppSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        if (!mounted) return;
        setProduct(data.product as Product);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const isInWishlist = useMemo(() => {
    if (!product) return false;
    return wishlist.some((p) => p._id === product._id);
  }, [product, wishlist]);

  if (loading) return <div className="text-sm text-neutral-600 dark:text-neutral-400">Loading…</div>;
  if (!product) return <div className="text-sm text-neutral-600 dark:text-neutral-400">Not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="self-start overflow-hidden rounded-xl border border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/40">
        <Swiper
          spaceBetween={12}
          slidesPerView={1}
          onSwiper={(s) => setSwiperInstance(s)}
          onSlideChange={(s) => setActiveImageIndex((s as any).realIndex ?? (s as any).activeIndex ?? 0)}
        >
          {(product.images ?? []).map((src) => (
            <SwiperSlide key={src}>
              <img src={src} alt={product.name} className="h-72 w-full object-cover sm:h-[420px]" />
            </SwiperSlide>
          ))}
        </Swiper>

        {product.images?.length ? (
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((src, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      swiperInstance?.slideTo?.(idx);
                    }}
                    className={`h-14 w-14 flex-none overflow-hidden rounded-md border bg-white dark:bg-black ${
                      isActive
                        ? "border-neutral-900 dark:border-neutral-300"
                        : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-600"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">{product.brand}</div>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">{product.name}</h1>
          <div className="mt-2 text-neutral-800 dark:text-neutral-200">{formatMoney(product.price)}</div>
        </div>

        <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{product.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Shipping</div>
            <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <div>Typical route: China → Bangladesh (time varies by courier).</div>
              <div>Tracking events show up after payment confirmation.</div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Returns & exchanges</div>
            <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <div>Request within 7 days of delivery (unworn condition).</div>
              <div>Keep the original box and packaging for eligibility.</div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Authenticity</div>
            <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <div>Curated listings with clear brand/model details.</div>
              <div>If something looks off, contact support immediately.</div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Payment</div>
            <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <div>Secure checkout.</div>
              <div>You’ll receive an order and tracking ID after confirmation.</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">How tracking works</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            After confirmation, Exporium creates your order and assigns a tracking ID. Use it on the Track page to view
            shipment timeline updates (processing, dispatched, in transit, delivered).
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">Select size</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  size === s
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:border-neutral-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-500">Stock: {product.stock}</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            onClick={() => {
              dispatch(
                addToCart({
                  productId: product._id,
                  name: product.name,
                  image: product.images[0],
                  price: product.price,
                  quantity: 1,
                  size: size || undefined
                })
              );
              navigate("/cart");
            }}
          >
            Add to cart
          </button>

          <button
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
            onClick={() => {
              if (!token) return navigate("/login");
              if (isInWishlist) dispatch(removeWishlist(product._id));
              else dispatch(addWishlist(product._id));
            }}
          >
            {isInWishlist ? "Remove wishlist" : "Add wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
