/**
 * Generates automated document codes based on type, year, month, and sequence.
 * Example result: PO-202506-0001
 *
 * @param type - The document prefix (e.g. PO, SO, GRN, WO)
 * @param year - Four-digit year
 * @param month - One or two-digit month
 * @param seq - Sequence number
 * @returns Document code string
 */
export function generateDocumentCode(
  type: string,
  year: number,
  month: number,
  seq: number
): string {
  const formattedMonth = String(month).padStart(2, '0');
  const formattedSeq = String(seq).padStart(4, '0');
  return `${type.toUpperCase()}-${year}${formattedMonth}-${formattedSeq}`;
}
