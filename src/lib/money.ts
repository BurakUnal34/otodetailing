const formatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

export function formatTryFromCents(cents: number): string {
  return formatter.format(cents / 100);
}

export function parseTryToCents(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
