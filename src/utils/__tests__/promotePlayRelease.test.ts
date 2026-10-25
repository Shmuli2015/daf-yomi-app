const {
  buildProductionTrack,
  pickAlphaRelease,
  versionNamesMatch,
} = require('../../../scripts/promotePlayRelease');

describe('pickAlphaRelease', () => {
  const releases = [
    { name: '1.2.2', status: 'completed', versionCodes: ['40'] },
    { name: 'v1.2.3', status: 'completed', versionCodes: ['41'] },
  ];

  it('matches a release name with or without a v prefix', () => {
    expect(versionNamesMatch('v1.2.3', '1.2.3')).toBe(true);
    expect(pickAlphaRelease(releases, '1.2.3').versionCodes).toEqual(['41']);
  });

  it('uses the first completed alpha release when the name does not match', () => {
    expect(pickAlphaRelease([{ name: 'alpha', status: 'completed', versionCodes: ['9'] }], '1.2.3').versionCodes).toEqual(['9']);
  });

  it('fails when alpha has no release', () => {
    expect(() => pickAlphaRelease([], '1.2.3')).toThrow(/No alpha release/);
  });
});

describe('buildProductionTrack', () => {
  it('copies the alpha version codes and Hebrew notes onto production', () => {
    const track = buildProductionTrack(
      { versionCodes: ['41'] },
      '• ניקוי מיקומי קריאה',
      '1.2.3',
    );
    expect(track.releases[0]).toEqual({
      name: '1.2.3',
      versionCodes: ['41'],
      status: 'completed',
      releaseNotes: [{ language: 'he-IL', text: '• ניקוי מיקומי קריאה' }],
    });
  });

  it('fails without notes', () => {
    expect(() => buildProductionTrack({ versionCodes: ['41'] }, '', '1.2.3')).toThrow(/what's new/i);
  });
});
