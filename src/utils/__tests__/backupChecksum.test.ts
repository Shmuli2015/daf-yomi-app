import { computeBackupChecksum, buildBackupCanonicalPayload } from '../backupChecksum';

describe('backupChecksum', () => {
  it('computes deterministic checksum for identical payload', () => {
    const payload = buildBackupCanonicalPayload([{ id: 1 }], { theme: 'dark' });
    const hashA = computeBackupChecksum(payload);
    const hashB = computeBackupChecksum(payload);

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(16);
  });

  it('produces different checksum when payload changes', () => {
    const payloadA = buildBackupCanonicalPayload([{ id: 1 }], { theme: 'dark' });
    const payloadB = buildBackupCanonicalPayload([{ id: 2 }], { theme: 'dark' });

    expect(computeBackupChecksum(payloadA)).not.toBe(computeBackupChecksum(payloadB));
  });

  it('handles empty records and undefined personal track gracefully', () => {
    const payload = buildBackupCanonicalPayload([], {});
    const hash = computeBackupChecksum(payload);

    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(16);
  });

  it('ignores auto_backup_directory_uri so older checksums still match', () => {
    const withoutDirectory = { theme: 'dark', auto_backup_file_uri: null };
    const withDirectory = {
      ...withoutDirectory,
      auto_backup_directory_uri: 'content://tree',
    };

    expect(buildBackupCanonicalPayload([], withDirectory)).toBe(
      buildBackupCanonicalPayload([], withoutDirectory),
    );
  });
});
