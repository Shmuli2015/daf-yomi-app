import * as FileSystem from 'expo-file-system/legacy';
import {
  CHAVRUTA_CACHE_VERSION,
  clearChavrutaCache,
  fetchChavrutaAmud,
  invalidateChavrutaMemoryCache,
} from '../chavrutaApi';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///files/',
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

const files = new Map<string, string>();

function encodeWindows1255(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 0x05d0 && code <= 0x05ea) {
      bytes[i] = 0xe0 + (code - 0x05d0);
    } else {
      bytes[i] = code & 0xff;
    }
  }
  return bytes;
}

function chavrutaHtml(body = 'שלום עולם'): string {
  return `<u>דף ב - א</u><span style='font-size:17px; line-height: 140%; color:RGB(0,0,0);'>${body}</span>`;
}

function mockFetchHtml(html: string): void {
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    arrayBuffer: async () => encodeWindows1255(html).buffer,
  })) as unknown as typeof fetch;
}

describe('chavrutaApi', () => {
  beforeEach(() => {
    files.clear();
    invalidateChavrutaMemoryCache();
    jest.clearAllMocks();

    (FileSystem.getInfoAsync as jest.Mock).mockImplementation(async (path: string) => {
      if (path.endsWith('/')) {
        return { exists: true };
      }
      const content = files.get(path);
      if (!content) {
        return { exists: false, size: 0 };
      }
      return { exists: true, size: content.length };
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockImplementation(async (path: string) => {
      const content = files.get(path);
      if (!content) {
        throw new Error('missing');
      }
      return content;
    });
    (FileSystem.writeAsStringAsync as jest.Mock).mockImplementation(
      async (path: string, content: string) => {
        files.set(path, content);
      }
    );
    (FileSystem.deleteAsync as jest.Mock).mockImplementation(async (path: string) => {
      if (path.endsWith('/')) {
        files.clear();
        return;
      }
      files.delete(path);
    });
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    globalThis.fetch = jest.fn(async () => {
      throw new Error('unexpected fetch');
    });
  });

  afterEach(() => {
    invalidateChavrutaMemoryCache();
  });

  it('throws when the masechet has no Chavruta source', async () => {
    await expect(fetchChavrutaAmud('Kinnim', 2, 'a')).rejects.toThrow(
      'אין ביאור חברותא למסכת זו'
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fetches from the network and then serves later amudim from memory', async () => {
    mockFetchHtml(chavrutaHtml());

    const first = await fetchChavrutaAmud('Berachot', 2, 'a');
    expect(first.paragraphs[0].text).toContain('שלום עולם');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const second = await fetchChavrutaAmud('Berachot', 2, 'a');
    expect(second.paragraphs[0].text).toContain('שלום עולם');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('ignores an old cache version and refetches', async () => {
    files.set(
      'file:///files/chavruta/Berachot.json',
      JSON.stringify({
        v: 1,
        masechetEn: 'Berachot',
        amudim: [{ dafNum: 2, amud: 'a', titleHe: 'ישן', paragraphs: [], footnotes: [] }],
      }).padEnd(120, ' ')
    );
    mockFetchHtml(chavrutaHtml('טקסט חדש'));

    const page = await fetchChavrutaAmud('Berachot', 2, 'a');
    expect(page.paragraphs[0].text).toContain('טקסט חדש');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('reads a valid disk cache after memory is cleared', async () => {
    const cached = {
      v: CHAVRUTA_CACHE_VERSION,
      masechetEn: 'Berachot',
      amudim: [
        {
          dafNum: 2,
          amud: 'a',
          titleHe: 'דף ב - א',
          paragraphs: [{ text: 'מהדיסק', footnoteRefs: [] }],
          footnotes: [],
        },
      ],
    };
    const payload = JSON.stringify(cached);
    expect(payload.length).toBeGreaterThan(100);
    files.set('file:///files/chavruta/Berachot.json', payload);

    const page = await fetchChavrutaAmud('Berachot', 2, 'a');
    expect(page.paragraphs[0].text).toBe('מהדיסק');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('forceRefresh deletes the cache file and hits the network', async () => {
    files.set(
      'file:///files/chavruta/Berachot.json',
      JSON.stringify({
        v: CHAVRUTA_CACHE_VERSION,
        masechetEn: 'Berachot',
        amudim: [
          {
            dafNum: 2,
            amud: 'a',
            titleHe: 'דף ב - א',
            paragraphs: [{ text: 'ישן', footnoteRefs: [] }],
            footnotes: [],
          },
        ],
      }).padEnd(120, ' ')
    );
    mockFetchHtml(chavrutaHtml('רענון'));

    const page = await fetchChavrutaAmud('Berachot', 2, 'a', { forceRefresh: true });
    expect(page.paragraphs[0].text).toContain('רענון');
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when the amud is missing from the parsed document', async () => {
    mockFetchHtml(chavrutaHtml());
    await expect(fetchChavrutaAmud('Berachot', 3, 'a')).rejects.toThrow(
      'לא נמצא ביאור חברותא לעמוד זה'
    );
  });

  it('clearChavrutaCache wipes memory and the cache directory', async () => {
    mockFetchHtml(chavrutaHtml());
    await fetchChavrutaAmud('Berachot', 2, 'a');
    await clearChavrutaCache();
    expect(FileSystem.deleteAsync).toHaveBeenCalled();

    mockFetchHtml(chavrutaHtml('אחרי ניקוי'));
    const page = await fetchChavrutaAmud('Berachot', 2, 'a');
    expect(page.paragraphs[0].text).toContain('אחרי ניקוי');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
