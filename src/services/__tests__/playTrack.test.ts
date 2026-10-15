import { isPlayProductionTrack, isPlayStoreBuild, getPlayTrack } from '../../services/playTrack';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

const Constants = require('expo-constants').default;

describe('playTrack', () => {
  const previous = process.env.EXPO_PUBLIC_PLAY_TRACK;

  afterEach(() => {
    Constants.expoConfig.extra = {};
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_PLAY_TRACK;
    } else {
      process.env.EXPO_PUBLIC_PLAY_TRACK = previous;
    }
  });

  it('reads production from extra and enables store review gate', () => {
    Constants.expoConfig.extra = { playTrack: 'production' };
    delete process.env.EXPO_PUBLIC_PLAY_TRACK;
    expect(getPlayTrack()).toBe('production');
    expect(isPlayProductionTrack()).toBe(true);
    expect(isPlayStoreBuild()).toBe(true);
  });

  it('treats alpha as a store build that is not production', () => {
    Constants.expoConfig.extra = { playTrack: 'alpha' };
    delete process.env.EXPO_PUBLIC_PLAY_TRACK;
    expect(isPlayProductionTrack()).toBe(false);
    expect(isPlayStoreBuild()).toBe(true);
  });

  it('treats missing track as non-production', () => {
    Constants.expoConfig.extra = {};
    delete process.env.EXPO_PUBLIC_PLAY_TRACK;
    expect(getPlayTrack()).toBe('');
    expect(isPlayProductionTrack()).toBe(false);
    expect(isPlayStoreBuild()).toBe(false);
  });

  it('treats none as outside the store', () => {
    Constants.expoConfig.extra = { playTrack: 'none' };
    delete process.env.EXPO_PUBLIC_PLAY_TRACK;
    expect(isPlayStoreBuild()).toBe(false);
  });
});
