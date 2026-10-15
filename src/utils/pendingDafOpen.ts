import type { StudyReminderTarget } from './studyReminderTarget';

let pendingTarget: StudyReminderTarget | null = null;
let lastQueuedNotificationId: string | undefined;
let listener: (() => void) | null = null;

export function queuePendingDafOpen(target: StudyReminderTarget, notificationId?: string): void {
  if (notificationId && notificationId === lastQueuedNotificationId) return;
  lastQueuedNotificationId = notificationId;
  pendingTarget = target;
  listener?.();
}

export function takePendingDafOpen(): StudyReminderTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}

export function subscribePendingDafOpen(next: () => void): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}
