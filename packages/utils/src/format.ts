/**
 * Formats a numeric amount to Indonesian Rupiah currency format.
 *
 * @param amount - The numeric value in complete Rupiah.
 * @returns Formatted currency string, e.g. Rp 1.500.000
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts a UTC Date to a formatted string in WIB (Western Indonesian Time).
 *
 * @param date - The Date object or date string.
 * @param tz - Optional timezone override, default is 'Asia/Jakarta' (WIB).
 * @returns Formatted date string.
 */
export function formatDate(date: Date | string, tz: string = 'Asia/Jakarta'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('id-ID', {
    timeZone: tz,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
