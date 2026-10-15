export const AUTO_BACKUP_INTERVALS = ['daily', 'weekly', 'monthly'] as const;

export type AutoBackupInterval = (typeof AUTO_BACKUP_INTERVALS)[number];

const INTERVAL_MS: Record<AutoBackupInterval, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const INTERVAL_LABELS: Record<AutoBackupInterval, string> = {
  daily: 'יומי',
  weekly: 'שבועי',
  monthly: 'חודשי',
};

export function normalizeAutoBackupInterval(value: unknown): AutoBackupInterval {
  if (value === 'daily' || value === 'weekly' || value === 'monthly') return value;
  return 'weekly';
}

export function autoBackupIntervalLabel(interval: AutoBackupInterval): string {
  return INTERVAL_LABELS[interval];
}

export function isAutoBackupDue(
  lastBackupAt: string | null | undefined,
  interval: unknown,
  now: Date = new Date(),
): boolean {
  if (!lastBackupAt) return true;
  const parsed = Date.parse(lastBackupAt);
  if (!Number.isFinite(parsed)) return true;
  const span = INTERVAL_MS[normalizeAutoBackupInterval(interval)];
  return now.getTime() - parsed >= span;
}
