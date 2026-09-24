export type StoreReviewReason = 'siyum' | 'streak7';

export const STORE_REVIEW_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
export const STORE_REVIEW_STREAK_THRESHOLD = 7;

export function shouldRequestStoreReview(
  reason: StoreReviewReason,
  options: {
    lastPromptAt: string | null;
    streak7Prompted: boolean;
    now?: number;
  },
): boolean {
  const now = options.now ?? Date.now();
  if (options.lastPromptAt) {
    const last = Date.parse(options.lastPromptAt);
    if (Number.isFinite(last) && now - last < STORE_REVIEW_COOLDOWN_MS) {
      return false;
    }
  }
  if (reason === 'streak7' && options.streak7Prompted) {
    return false;
  }
  return true;
}
