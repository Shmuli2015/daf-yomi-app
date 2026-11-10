import { isSentryEnvironmentEnabled, resolveSentryEnvironment } from '../sentryEnvironment';

describe('sentryEnvironment', () => {
  it.each(['production', 'alpha', 'debug', 'preview'])('enables %s', environment => {
    expect(isSentryEnvironmentEnabled(environment)).toBe(true);
  });

  it.each(['development', 'internal'])('disables %s', environment => {
    expect(isSentryEnvironmentEnabled(environment)).toBe(false);
  });

  it('prefers a play track over the build profile', () => {
    expect(resolveSentryEnvironment('alpha', 'production')).toBe('alpha');
    expect(resolveSentryEnvironment('internal', 'production')).toBe('internal');
  });

  it('uses the build profile when there is no play track', () => {
    expect(resolveSentryEnvironment('', 'debug')).toBe('debug');
    expect(resolveSentryEnvironment('none', 'preview')).toBe('preview');
  });

  it('falls back to development outside a release build', () => {
    expect(resolveSentryEnvironment('', '')).toBe('development');
    expect(resolveSentryEnvironment('none', '')).toBe('development');
  });
});
