import { Link } from "react-router-dom";

import type { Product } from "../types/models";
import { formatMoney } from "../utils/format";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="group rounded-lg border border-neutral-800 bg-neutral-950/40 p-3 hover:border-neutral-700"
    >
      <div className="aspect-square overflow-hidden rounded-md border border-neutral-900 bg-neutral-900">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <div className="text-sm text-neutral-400">{product.brand}</div>
        <div className="mt-1 font-medium text-white">{product.name}</div>
        <div className="mt-2 text-sm text-neutral-200">{formatMoney(product.price)}</div>
      </div>
    </Link>
  );
}
