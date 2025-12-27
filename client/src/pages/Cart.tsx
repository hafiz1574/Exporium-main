import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { removeFromCart, setQuantity } from "../store/slices/cartSlice";
import { formatMoney } from "../utils/format";

export function Cart() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const items = useAppSelector((s) => s.cart.items);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const checkoutDisabled = true;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Cart</h1>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Your cart is empty.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.size ?? ""}`}
                className="flex gap-4 rounded-xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-white">{item.name}</div>
                  <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {item.size ? `Size: ${item.size}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">{formatMoney(item.price)}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      dispatch(
                        setQuantity({
                          productId: item.productId,
                          size: item.size,
                          quantity: Number(e.target.value)
                        })
                      )
                    }
                    className="w-20 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-white"
                  />
                  <button
                    className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                    onClick={() => dispatch(removeFromCart({ productId: item.productId, size: item.size }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 h-fit dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
              <span>Total</span>
              <span className="text-neutral-900 font-semibold dark:text-white">{formatMoney(total)}</span>
            </div>
            <button
              disabled={checkoutDisabled}
              onClick={() => {
                if (!token) navigate("/login");
              }}
              className="mt-4 w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Checkout
            </button>
            {checkoutDisabled ? (
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Checkout is currently unavailable.</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
