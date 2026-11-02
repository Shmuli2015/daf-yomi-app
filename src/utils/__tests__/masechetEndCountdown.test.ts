import { formatMasechetEndCountdown, getDaysUntilMasechetEnd } from '../masechetEndCountdown';

describe('masechetEndCountdown', () => {
  describe('getDaysUntilMasechetEnd', () => {
    it('counts remaining Berakhot dapim including the current one as today', () => {
      expect(getDaysUntilMasechetEnd('ברכות', 64)).toBe(0);
      expect(getDaysUntilMasechetEnd('ברכות', 63)).toBe(1);
      expect(getDaysUntilMasechetEnd('ברכות', 60)).toBe(4);
    });

    it('returns null past the last daf, for a shared Kinnim calendar daf, and for unknown masechtot', () => {
      expect(getDaysUntilMasechetEnd('ברכות', 65)).toBeNull();
      expect(getDaysUntilMasechetEnd('קינים', 25)).toBeNull();
      expect(getDaysUntilMasechetEnd('לא קיימת', 2)).toBeNull();
    });
  });

  describe('formatMasechetEndCountdown', () => {
    it('uses today, tomorrow, and N days copy', () => {
      expect(formatMasechetEndCountdown('ברכות', 0)).toBe('היום סיום ברכות');
      expect(formatMasechetEndCountdown('ברכות', 1)).toBe('מחר סיום ברכות');
      expect(formatMasechetEndCountdown('ברכות', 4)).toBe('עוד 4 ימים לסיום ברכות');
    });
  });
});
