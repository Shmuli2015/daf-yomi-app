import {
  matchesAllTokens,
  normalizeForSearch,
  splitByHighlight,
  stripHebrewPrefix,
  tokenizeQuery,
  buildHighlightRegex,
} from '../guideSearchUtils';

describe('guideSearchUtils', () => {
  describe('normalizeForSearch', () => {
    it('removes niqqud and normalizes geresh quotes', () => {
      const withNiqqud = 'מַסֶּכֶת';
      expect(normalizeForSearch(withNiqqud)).toBe('מסכת');

      const withGeresh = 'ש״ס';
      expect(normalizeForSearch(withGeresh)).toBe('שס');

      const withApostrophe = "עמוד א'";
      expect(normalizeForSearch(withApostrophe)).toBe('עמוד א');
    });
  });

  describe('stripHebrewPrefix', () => {
    it('strips common Hebrew prefixes when stem is at least 3 letters', () => {
      expect(stripHebrewPrefix('להגדרות')).toBe('הגדרות');
      expect(stripHebrewPrefix('בקורא')).toBe('קורא');
      expect(stripHebrewPrefix('מהבית')).toBe('הבית');
      expect(stripHebrewPrefix('וכשלמדת')).toBe('למדת');
    });

    it('retains short words without over-stripping', () => {
      expect(stripHebrewPrefix('דף')).toBe('דף');
      expect(stripHebrewPrefix('לו')).toBe('לו');
      expect(stripHebrewPrefix('הכל')).toBe('הכל');
    });
  });

  describe('tokenizeQuery', () => {
    it('splits into distinct normalized tokens', () => {
      const tokens = tokenizeQuery('סימון קורא קורא');
      expect(tokens).toEqual(['סימון', 'קורא']);
    });

    it('ignores 1-letter noise tokens', () => {
      const tokens = tokenizeQuery('דף ב יום');
      expect(tokens).toEqual(['דף', 'יום']);
    });
  });

  describe('matchesAllTokens', () => {
    it('matches all tokens regardless of order (AND logic)', () => {
      const text = 'כיצד עוברים בין פירוש רש״י, שטיינזלץ וחברותא בקורא?';
      expect(matchesAllTokens(text, ['רשי', 'קורא'])).toBe(true);
      expect(matchesAllTokens(text, ['קורא', 'רשי'])).toBe(true);
      expect(matchesAllTokens(text, ['קורא', 'הגדרות'])).toBe(false);
    });

    it('matches prefixed query token against unprefixed text', () => {
      const text = 'פתיחת מסך ההגדרות';
      expect(matchesAllTokens(text, tokenizeQuery('להגדרות'))).toBe(true);
    });

    it('returns true on empty tokens array', () => {
      expect(matchesAllTokens('טקסט כלשהו', [])).toBe(true);
    });
  });

  describe('buildHighlightRegex and splitByHighlight', () => {
    it('splits text correctly into matched and unmatched segments', () => {
      const tokens = ['קורא'];
      const regex = buildHighlightRegex(tokens);
      expect(regex).not.toBeNull();

      const segments = splitByHighlight('הקשה בקורא הטקסט', regex);
      expect(segments).toEqual([
        { text: 'הקשה ב', isMatch: false },
        { text: 'קורא', isMatch: true },
        { text: ' הטקסט', isMatch: false },
      ]);
    });

    it('returns single unmatched segment when no regex provided', () => {
      expect(splitByHighlight('שלום עולם', null)).toEqual([
        { text: 'שלום עולם', isMatch: false },
      ]);
    });
  });
});
