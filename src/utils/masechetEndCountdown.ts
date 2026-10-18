import { getMasechetDafim } from './shas';
import { isKinnimTamidSharedCalendarDaf } from './mishnahOnlySefaria';

export function getDaysUntilMasechetEnd(masechetHe: string, dafNum: number): number | null {
  if (isKinnimTamidSharedCalendarDaf(masechetHe, dafNum)) return null;
  const dafim = getMasechetDafim(masechetHe);
  if (dafim.length === 0) return null;
  const lastDaf = dafim[dafim.length - 1];
  const daysLeft = lastDaf - dafNum;
  return daysLeft >= 0 ? daysLeft : null;
}

export function formatMasechetEndCountdown(masechetHe: string, daysLeft: number): string {
  if (daysLeft === 0) return `היום סיום ${masechetHe}`;
  if (daysLeft === 1) return `מחר סיום ${masechetHe}`;
  return `עוד ${daysLeft} ימים לסיום ${masechetHe}`;
}
