import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef } from "react";
import { Link } from "react-router-dom";

import type { Product } from "../types/models";
import { formatMoney } from "../utils/format";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const isDraggingRef = useRef(false);

  function handleCarouselClickCapture(e: React.MouseEvent) {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
  }

  const hasImages = Boolean(product.images && product.images.length > 0);
  const canSlide = Boolean(product.images && product.images.length > 1);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group rounded-lg border border-neutral-800 bg-neutral-950/40 p-3 hover:border-neutral-700"
    >
      <div className="aspect-square overflow-hidden rounded-md border border-neutral-900 bg-neutral-900">
        {hasImages ? (
          <div onClickCapture={handleCarouselClickCapture}>
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              loop={canSlide}
              allowTouchMove={canSlide}
              onTouchMove={() => {
                isDraggingRef.current = true;
              }}
              onTouchEnd={() => {
                // let the click event (if any) occur, then reset
                window.setTimeout(() => {
                  isDraggingRef.current = false;
                }, 0);
              }}
            >
              {product.images.map((src) => (
                <SwiperSlide key={src}>
                  <img
                    src={src}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <div className="mt-3">
        <div className="text-sm text-neutral-400">{product.brand}</div>
        <div className="mt-1 font-medium text-white">{product.name}</div>
        <div className="mt-2 text-sm text-neutral-200">{formatMoney(product.price)}</div>
      </div>
    </Link>
  );
}
