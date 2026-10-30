export type BackupFileAccess = {
  readonly exists: boolean;
  read(): string;
  write(content: string): void;
};

export type RotateBackupResult = 'written' | 'rotate_failed' | 'write_failed';

function samePayload(actual: string, expected: string): boolean {
  if (actual === expected) return true;
  try {
    return JSON.stringify(JSON.parse(actual)) === JSON.stringify(JSON.parse(expected));
  } catch {
    return false;
  }
}

export function rotateAndWriteBackup(
  current: BackupFileAccess,
  previous: BackupFileAccess,
  nextContents: string,
): RotateBackupResult {
  let existing = '';
  if (current.exists) {
    try {
      existing = current.read();
    } catch {
      return 'rotate_failed';
    }
  }

  if (existing.length > 0) {
    try {
      previous.write(existing);
      if (!samePayload(previous.read(), existing)) return 'rotate_failed';
    } catch {
      return 'rotate_failed';
    }
  }

  try {
    current.write(nextContents);
    if (!samePayload(current.read(), nextContents)) return 'write_failed';
  } catch {
    return 'write_failed';
  }

  return 'written';
}
