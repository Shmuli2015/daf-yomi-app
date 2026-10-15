import { rotateAndWriteBackup, type BackupFileAccess } from '../autoBackupWrite';

function memoryFile(initial: string | null): BackupFileAccess & { value: string | null } {
  const state = { value: initial };
  return {
    get value() {
      return state.value;
    },
    get exists() {
      return state.value !== null;
    },
    read() {
      if (state.value === null) throw new Error('missing');
      return state.value;
    },
    write(content: string) {
      state.value = content;
    },
  };
}

describe('rotateAndWriteBackup', () => {
  it('writes the first backup without touching an empty previous file', () => {
    const current = memoryFile('');
    const previous = memoryFile('');
    const next = '{"backupVersion":2}';
    expect(rotateAndWriteBackup(current, previous, next)).toBe('written');
    expect(current.value).toBe(next);
    expect(previous.value).toBe('');
  });

  it('copies the current file before replacing it', () => {
    const current = memoryFile('{"exportedAt":"old"}');
    const previous = memoryFile('{"exportedAt":"older"}');
    const next = '{"exportedAt":"new"}';
    expect(rotateAndWriteBackup(current, previous, next)).toBe('written');
    expect(previous.value).toBe('{"exportedAt":"old"}');
    expect(current.value).toBe(next);
  });

  it('leaves the current file untouched when the previous copy fails', () => {
    const current = memoryFile('{"exportedAt":"good"}');
    const previous: BackupFileAccess = {
      exists: true,
      read: () => '',
      write() {
        throw new Error('denied');
      },
    };
    expect(rotateAndWriteBackup(current, previous, '{"exportedAt":"new"}')).toBe('rotate_failed');
    expect(current.read()).toBe('{"exportedAt":"good"}');
  });

  it('reports a write failure when the new file cannot be confirmed', () => {
    const previous = memoryFile('');
    const broken: BackupFileAccess = {
      exists: true,
      read: () => 'not-json',
      write() {},
    };
    expect(rotateAndWriteBackup(broken, previous, '{"ok":true}')).toBe('write_failed');
    expect(previous.read()).toBe('not-json');
    expect(broken.read()).toBe('not-json');
  });

  it('fails when the current file is missing', () => {
    const current = memoryFile(null);
    const previous = memoryFile('');
    expect(rotateAndWriteBackup(current, previous, '{}')).toBe('write_failed');
  });
});
