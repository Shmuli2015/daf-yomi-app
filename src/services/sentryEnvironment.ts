const ENABLED_SENTRY_ENVIRONMENTS = new Set(['production', 'alpha', 'debug', 'preview']);

export function resolveSentryEnvironment(playTrack: string, buildProfile: string): string {
  if (playTrack && playTrack !== 'none') {
    return playTrack;
  }
  if (buildProfile) {
    return buildProfile;
  }
  return 'development';
}

export function isSentryEnvironmentEnabled(environment: string): boolean {
  return ENABLED_SENTRY_ENVIRONMENTS.has(environment);
}
