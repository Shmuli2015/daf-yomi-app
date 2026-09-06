/**
 * Replaces expo-notifications' DevicePushTokenAutoRegistration side effect.
 * That module calls addPushTokenListener on import, which Expo Go Android
 * throws on (remote push was removed from Expo Go in SDK 53).
 * This app only uses local scheduled reminders, not Expo Push tokens.
 */
export async function setAutoServerRegistrationEnabledAsync(_enabled: boolean): Promise<void> {}

export async function __handlePersistedRegistrationInfoAsync(
  _registrationInfo: string | null | undefined,
): Promise<void> {}
