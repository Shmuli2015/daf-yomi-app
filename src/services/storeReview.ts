import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';
import {
  getSettings,
  markStoreReviewPrompted,
} from '../db/database';
import {
  shouldRequestStoreReview,
  STORE_REVIEW_STREAK_THRESHOLD,
  type StoreReviewReason,
} from './storeReviewPolicy';

export {
  shouldRequestStoreReview,
  STORE_REVIEW_COOLDOWN_MS,
  STORE_REVIEW_STREAK_THRESHOLD,
  type StoreReviewReason,
} from './storeReviewPolicy';

export async function maybeRequestStoreReview(reason: StoreReviewReason): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const settings = getSettings();
    if (
      !shouldRequestStoreReview(reason, {
        lastPromptAt: settings.last_store_review_prompt_at,
        streak7Prompted: settings.store_review_streak7_prompted === 1,
      })
    ) {
      return false;
    }

    const available = await StoreReview.isAvailableAsync();
    if (!available) return false;

    await StoreReview.requestReview();
    markStoreReviewPrompted(reason);
    return true;
  } catch {
    return false;
  }
}

export function maybeRequestStoreReviewForStreak(streak: number): void {
  if (streak < STORE_REVIEW_STREAK_THRESHOLD) return;
  void maybeRequestStoreReview('streak7');
}
