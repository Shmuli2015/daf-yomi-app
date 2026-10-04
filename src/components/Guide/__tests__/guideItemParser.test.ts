import { splitLeadFromBody } from '../guideItemParser';

describe('guideItemParser', () => {
  it('extracts lead title when formatted with double asterisks', () => {
    const item = '**פתיחת הקורא**: כפתור לימוד הדף פותח את מסך הקריאה.';
    const parsed = splitLeadFromBody(item);
    expect(parsed.lead).toBe('פתיחת הקורא');
    expect(parsed.body).toBe('כפתור לימוד הדף פותח את מסך הקריאה.');
  });

  it('extracts lead title when formatted with double brackets', () => {
    const item = '[[לימוד הדף]]: כפתור הפותח את מסך הקריאה.';
    const parsed = splitLeadFromBody(item);
    expect(parsed.lead).toBe('לימוד הדף');
    expect(parsed.body).toBe('כפתור הפותח את מסך הקריאה.');
  });

  it('returns null lead when item has no colon separator', () => {
    const item = 'מעבר בין הימים מתבצע באמצעות החצים שבראש המסך.';
    const parsed = splitLeadFromBody(item);
    expect(parsed.lead).toBeNull();
    expect(parsed.body).toBe(item);
  });

  it('rejects overly long leads or leads with mid-sentence punctuation', () => {
    const item = 'כאשר הדף מסומן כנלמד, יופיע הכיתוב: אשריך.';
    const parsed = splitLeadFromBody(item);
    expect(parsed.lead).toBeNull();
    expect(parsed.body).toBe(item);
  });
});
