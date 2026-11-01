let reminderScheduleQueue: Promise<void> = Promise.resolve();

export function withReminderScheduleLock<T>(work: () => Promise<T>): Promise<T> {
  const run = reminderScheduleQueue.then(work, work);
  reminderScheduleQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
