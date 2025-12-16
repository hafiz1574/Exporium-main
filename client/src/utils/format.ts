export function formatMoney(amount: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
