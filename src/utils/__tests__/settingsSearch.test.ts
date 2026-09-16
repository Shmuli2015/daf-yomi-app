import { isLastVisible, matchesAnySetting, matchesSetting } from '../settingsSearch';

describe('settingsSearch', () => {
  it('matches title, description and synonyms', () => {
    const item = {
      title: 'אפקטים חגיגיים',
      description: 'הצגת קונפטי בסיום לימוד דף',
      synonyms: ['קונפטי', 'כהה'],
    };
    expect(matchesSetting('קונפטי', item)).toBe(true);
    expect(matchesSetting('חגיגיים', item)).toBe(true);
    expect(matchesSetting('גיבוי', item)).toBe(false);
    expect(matchesSetting('', item)).toBe(true);
  });

  it('matches any item in a section', () => {
    const items = [
      { title: 'לימוד אישי', description: 'מעקב עצמאי' },
      { title: 'מצב תצוגה', synonyms: ['כהה'] },
    ];
    expect(matchesAnySetting('לימוד', items)).toBe(true);
    expect(matchesAnySetting('כהה', items)).toBe(true);
    expect(matchesAnySetting('נודניק', items)).toBe(false);
  });

  it('marks the last visible flag', () => {
    expect(isLastVisible([true, false, true], 2)).toBe(true);
    expect(isLastVisible([true, false, true], 0)).toBe(false);
  });
});
