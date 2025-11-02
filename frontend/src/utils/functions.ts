export function formatFileSize(bytes: number = 0, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(isoString: string | undefined): string {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
/**
 * Formats a currency amount.
 * By default, it assumes the amount is in the smallest unit (paise/cents)
 * and divides it by 100.
 */
export const formatCurrency = (
  amount: number,
  currency: "inr" | "usd" | "INR" | "USD",
  options: {
    /**
     * Set to 'false' if the amount is already in the main unit (e.g., 499 rupees).
     * By default, 'true' (e.g., 4990 paise).
     */
    amountInSmallestUnit?: boolean;
  } = { amountInSmallestUnit: true }
) => {
  // 1. Handle the special "Custom" case
  if (amount === -1) return "Custom";

  // 2. Normalize currency codes
  const lowerCurrency = currency.toLowerCase() as "inr" | "usd";
  const upperCurrency = currency.toUpperCase() as "INR" | "USD";

  // 3. Determine locale for correct symbols/formatting
  const locale = lowerCurrency === "inr" ? "en-IN" : "en-US";

  // 4. Determine the final amount to format
  const amountToFormat = options.amountInSmallestUnit
    ? amount / 100 // e.g., 4990 -> 49.90 (from your first function)
    : amount; // e.g., 499 -> 499 (from your second function)

  // 5. Set up formatter options
  const formatterOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: upperCurrency,
  };

  // 6. Apply decimal logic from your second function *only*
  // if we are *not* treating the amount as paise/cents.
  if (!options.amountInSmallestUnit) {
    formatterOptions.minimumFractionDigits = 0;
    formatterOptions.maximumFractionDigits = 0;
  }
  // Otherwise, we let Intl.NumberFormat use its default (e.g., 2 decimal places)
  // which is correct for amounts like ₹49.90.

  // 7. Create and return the formatted string
  return new Intl.NumberFormat(locale, formatterOptions).format(amountToFormat);
};
