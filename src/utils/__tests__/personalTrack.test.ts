import { isPersonalTrackEnabled } from '../personalTrack';

describe('isPersonalTrackEnabled', () => {
  it('defaults to enabled when settings are missing', () => {
    expect(isPersonalTrackEnabled(null)).toBe(true);
    expect(isPersonalTrackEnabled(undefined)).toBe(true);
    expect(isPersonalTrackEnabled({})).toBe(true);
  });

  it('follows the settings flag', () => {
    expect(isPersonalTrackEnabled({ show_personal_track_banner: 1 })).toBe(true);
    expect(isPersonalTrackEnabled({ show_personal_track_banner: 0 })).toBe(false);
  });
});
