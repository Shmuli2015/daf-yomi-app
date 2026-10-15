import {
  addPinnedPersonalMasechet,
  parsePinnedPersonalMasechtot,
  removePinnedPersonalMasechet,
  serializePinnedPersonalMasechtot,
} from '../pinnedPersonalMasechtot';

describe('pinnedPersonalMasechtot', () => {
  it('keeps a legacy single pinned masechet as one card', () => {
    expect(parsePinnedPersonalMasechtot(null, 'Berachot')).toEqual(['Berachot']);
  });

  it('returns an empty list when nothing is pinned', () => {
    expect(parsePinnedPersonalMasechtot(null, null)).toEqual([]);
    expect(parsePinnedPersonalMasechtot('[]', 'Berachot')).toEqual([]);
  });

  it('parses the stored list and removes duplicates and invalid entries', () => {
    expect(parsePinnedPersonalMasechtot('["Shabbat","Berachot","Shabbat",5,""]', null)).toEqual([
      'Shabbat',
      'Berachot',
    ]);
  });

  it('falls back to the legacy value for corrupt json', () => {
    expect(parsePinnedPersonalMasechtot('{oops', 'Eruvin')).toEqual(['Eruvin']);
  });

  it('adds without duplicating and removes by name', () => {
    expect(addPinnedPersonalMasechet(['Berachot'], 'Shabbat')).toEqual(['Berachot', 'Shabbat']);
    expect(addPinnedPersonalMasechet(['Berachot'], 'Berachot')).toEqual(['Berachot']);
    expect(removePinnedPersonalMasechet(['Berachot', 'Shabbat'], 'Berachot')).toEqual(['Shabbat']);
  });

  it('round trips through serialization', () => {
    const serialized = serializePinnedPersonalMasechtot(['Berachot', 'Shabbat']);
    expect(parsePinnedPersonalMasechtot(serialized, null)).toEqual(['Berachot', 'Shabbat']);
  });
});
