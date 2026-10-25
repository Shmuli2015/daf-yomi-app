import { getNextDafPrefetchTargets } from '../readerPrefetchTargets';

describe('readerPrefetchTargets', () => {
  it('returns next amud of current daf and both amudim of next daf when on amud a', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 2,
      amud: 'a',
    });

    expect(targets).toEqual([
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' },
      { masechetEn: 'Berachot', dafNum: 3, amud: 'a' },
      { masechetEn: 'Berachot', dafNum: 3, amud: 'b' },
    ]);
  });

  it('returns both amudim of next daf when on amud b', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 2,
      amud: 'b',
    });

    expect(targets).toEqual([
      { masechetEn: 'Berachot', dafNum: 3, amud: 'a' },
      { masechetEn: 'Berachot', dafNum: 3, amud: 'b' },
    ]);
  });

  it('transitions to next tractate when on the final page of a tractate', () => {
    const targets = getNextDafPrefetchTargets({
      masechetEn: 'Berachot',
      dafNum: 64,
      amud: 'a',
    });

    expect(targets).toEqual([
      { masechetEn: 'Shabbat', dafNum: 2, amud: 'a' },
      { masechetEn: 'Shabbat', dafNum: 2, amud: 'b' },
    ]);
  });

  it('only includes available amudim for tractates with asymmetric page ends', () => {
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
