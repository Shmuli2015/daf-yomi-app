import {
  QUOTES,
  DAF_YOMI_QUOTES,
  formatQuote,
  getRandomQuote,
  getRandomQuoteItem,
  getDailyQuote,
  getQuotesByCategory,
  DafYomiQuote,
  QuoteCategory,
} from '../quotes';

describe('quotes utility', () => {
  it('contains a rich list of verified quotes with valid schema', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(90);

    const validCategories: QuoteCategory[] = [
      'chazal',
      'tanakh',
      'avot',
      'gedolim',
      'chassidut',
      'daf_yomi',
      'inspiration',
    ];

    const ids = new Set<string>();

    for (const quote of QUOTES) {
      expect(quote.id).toBeTruthy();
      expect(ids.has(quote.id)).toBe(false);
      ids.add(quote.id);

      expect(quote.text).toBeTruthy();
      expect(quote.text.trim().length).toBeGreaterThan(0);
      expect(validCategories).toContain(quote.category);

      expect(quote.text).not.toContain('\u2014');
      expect(quote.text).not.toContain('--');
      if (quote.source) {
        expect(quote.source).not.toContain('\u2014');
        expect(quote.source).not.toContain('--');
      }
    }
  });

  it('verifies key corrected sources and attributions', () => {
    const pesachim = QUOTES.find((q) => q.id === 'chazal-pesachim-50a');
    expect(pesachim?.source).toBe('פסחים נ.');

    const tzidkat = QUOTES.find((q) => q.id === 'chassidut-tzidkat-hatzaddik-154');
    expect(tzidkat?.source).toBe('צדקת הצדיק, אות קנ״ד');

    const eichah = QUOTES.find((q) => q.id === 'chazal-eichah-rabbah-2');
    expect(eichah?.source).toBe('איכה רבה, פתיחתא ב');

    const mb = QUOTES.find((q) => q.id === 'gedolim-chofetz-chaim-mb-155');
    expect(mb?.source).toBe('משנה ברורה, סימן קנ״ה, ס״ק א');
  });

  it('formats quotes with and without sources correctly', () => {
    const quoteWithSource: DafYomiQuote = {
      id: 'test-1',
      text: 'עשה תורתך קבע',
      source: 'פרקי אבות א, טו',
      category: 'avot',
    };
    expect(formatQuote(quoteWithSource)).toBe('עשה תורתך קבע (פרקי אבות א, טו)');

    const quoteWithoutSource: DafYomiQuote = {
      id: 'test-2',
      text: 'דף אחרי דף, יום אחרי יום - כך כובשים את הש״ס.',
      category: 'inspiration',
    };
    expect(formatQuote(quoteWithoutSource)).toBe(
      'דף אחרי דף, יום אחרי יום - כך כובשים את הש״ס.'
    );
  });

  it('provides DAF_YOMI_QUOTES corresponding to QUOTES', () => {
    expect(DAF_YOMI_QUOTES.length).toBe(QUOTES.length);
    expect(DAF_YOMI_QUOTES[0]).toBe(formatQuote(QUOTES[0]));
  });

  it('getRandomQuote returns a formatted string from DAF_YOMI_QUOTES', () => {
    const quote = getRandomQuote();
    expect(typeof quote).toBe('string');
    expect(DAF_YOMI_QUOTES).toContain(quote);
  });

  it('getRandomQuoteItem returns a valid DafYomiQuote item', () => {
    const item = getRandomQuoteItem();
    expect(item).toBeDefined();
    expect(QUOTES).toContain(item);
  });

  it('getDailyQuote returns a deterministic quote for a given date', () => {
    const dateA = new Date(2026, 4, 15);
    const dateB = new Date(2026, 4, 15);
    const quoteA = getDailyQuote(dateA);
    const quoteB = getDailyQuote(dateB);

    expect(quoteA).toEqual(quoteB);
    expect(quoteA.id).toBeTruthy();
  });

  it('filters quotes by category correctly', () => {
    const chazalQuotes = getQuotesByCategory('chazal');
    expect(chazalQuotes.length).toBeGreaterThan(0);
    expect(chazalQuotes.every((q) => q.category === 'chazal')).toBe(true);

    const dafYomiQuotes = getQuotesByCategory('daf_yomi');
    expect(dafYomiQuotes.length).toBeGreaterThan(0);
    expect(dafYomiQuotes.every((q) => q.category === 'daf_yomi')).toBe(true);

    const avotQuotes = getQuotesByCategory('avot');
    expect(avotQuotes.length).toBeGreaterThan(0);
    expect(avotQuotes.every((q) => q.category === 'avot')).toBe(true);
  });
});
