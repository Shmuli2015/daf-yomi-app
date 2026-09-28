export const SNOOZE_REMINDER_PREFIX = 'later-reminder';

export function isSnoozeReminderId(identifier?: string | null): boolean {
  return typeof identifier === 'string' && identifier.startsWith(SNOOZE_REMINDER_PREFIX);
}
