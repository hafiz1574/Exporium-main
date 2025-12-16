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

  if (loading) return <div className="text-sm text-neutral-400">Loading…</div>;
  if (!product) return <div className="text-sm text-neutral-400">Not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/40">
        <Swiper spaceBetween={12} slidesPerView={1}>
          {product.images.map((src) => (
            <SwiperSlide key={src}>
              <img src={src} alt={product.name} className="h-[420px] w-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-neutral-400">{product.brand}</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">{product.name}</h1>
          <div className="mt-2 text-neutral-200">{formatMoney(product.price)}</div>
        </div>

        <p className="text-sm leading-6 text-neutral-300">{product.description}</p>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
          <div className="text-sm font-medium text-white">Select size</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  size === s
                    ? "border-white bg-white text-black"
                    : "border-neutral-700 bg-black text-white hover:border-neutral-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-500">Stock: {product.stock}</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
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
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:border-neutral-500"
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
