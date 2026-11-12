import { getNextDafPrefetchTargets } from '../readerPrefetchTargets';

describe('readerPrefetchTargets', () => {
  it('returns only the next amud when on amud a', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 2,
      amud: 'a',
    });

    expect(targets).toEqual([
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' },
    ]);
  });

  it('returns the first amud of the next daf when on amud b', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 2,
      amud: 'b',
    });

    expect(targets).toEqual([
      { masechetEn: 'Berachot', dafNum: 3, amud: 'a' },
    ]);
  });

  it('transitions to the next tractate when on the final page of a tractate', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 64,
      amud: 'a',
    });

    expect(targets).toEqual([
      { masechetEn: 'Shabbat', dafNum: 2, amud: 'a' },
    ]);
  });

  it('only includes an available amud for tractates with asymmetric page ends', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 63,
      amud: 'b',
    });

    expect(targets).toEqual([
      { masechetEn: 'Berachot', dafNum: 64, amud: 'a' },
    ]);
  });

  it('returns empty array when at the end of shas', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Niddah',
      dafNum: 73,
      amud: 'a',
    });

    expect(targets).toEqual([]);
  });
});
