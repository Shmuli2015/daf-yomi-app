import {
  shouldRequestStoreReview,
  STORE_REVIEW_COOLDOWN_MS,
} from '../storeReviewPolicy';

describe('shouldRequestStoreReview', () => {
  const now = Date.parse('2026-09-24T10:00:00.000Z');

  it('allows the first prompt', () => {
    expect(
      shouldRequestStoreReview('siyum', {
        lastPromptAt: null,
        streak7Prompted: false,
        now,
      }),
    ).toBe(true);
  });

  it('blocks during the cooldown window', () => {
    expect(
      shouldRequestStoreReview('siyum', {
        lastPromptAt: new Date(now - STORE_REVIEW_COOLDOWN_MS + 1000).toISOString(),
        streak7Prompted: false,
        now,
      }),
    ).toBe(false);
  });

  it('allows again after the cooldown', () => {
    expect(
      shouldRequestStoreReview('siyum', {
        lastPromptAt: new Date(now - STORE_REVIEW_COOLDOWN_MS - 1000).toISOString(),
        streak7Prompted: false,
        now,
      }),
    ).toBe(true);
  });

  it('asks for streak7 only once', () => {
    expect(
      shouldRequestStoreReview('streak7', {
        lastPromptAt: null,
        streak7Prompted: true,
        now,
      }),
    ).toBe(false);
  });

  it('still allows siyum after streak7 was prompted if cooldown passed', () => {
    expect(
      shouldRequestStoreReview('siyum', {
        lastPromptAt: new Date(now - STORE_REVIEW_COOLDOWN_MS - 1000).toISOString(),
        streak7Prompted: true,
        now,
      }),
    ).toBe(true);
  });
});
