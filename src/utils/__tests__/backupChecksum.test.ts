import {
  computeBackupChecksum,
  computeBackupDocumentChecksum,
  buildBackupCanonicalPayload,
  verifyBackupDocumentChecksum,
} from '../backupChecksum';

describe('backupChecksum', () => {
  it('computes deterministic sha-256 checksum for identical payload', () => {
    const payload = buildBackupCanonicalPayload([{ id: 1 }], { theme: 'dark' });
    const hashA = computeBackupChecksum(payload);
    const hashB = computeBackupChecksum(payload);

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it('matches a known sha-256 digest', () => {
    expect(computeBackupChecksum('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
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
    expect(hash).toHaveLength(64);
  });

  it('verifies a full backup document checksum round-trip', () => {
    const document = {
      backupVersion: 2,
      exportedAt: '2026-09-24T12:00:00.000Z',
      appVersion: '1.2.9',
      records: [{ date: '2026-09-24', masechet: 'ברכות', status: 'learned' }],
      settings: { theme_mode: 'system' },
      personalTrackRecords: [],
    };
    const checksum = computeBackupDocumentChecksum(document);
    expect(verifyBackupDocumentChecksum({ ...document, checksum })).toBe(true);
    expect(verifyBackupDocumentChecksum({ ...document, checksum: 'bad' })).toBe(false);
  });
});
