export function formatMoney(amount: number, currency: string = "BDT") {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency
    }).format(amount);
  } catch {
    return `৳${amount.toFixed(2)}`;
  }
}
