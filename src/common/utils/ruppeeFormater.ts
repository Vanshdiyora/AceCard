export function formatRupees(value?: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "₹0";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}
