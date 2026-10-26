import * as FileSystem from 'expo-file-system/legacy';
import {
  SEFARIA_TEXT_CACHE_VERSION,
  fetchSefariaPageText,
  invalidateSefariaTextMemoryCache,
} from '../sefariaTextApi';

jest.mock('../sefariaChapters', () => ({
  fetchSefariaChapters: jest.fn(async () => []),
  invalidateSefariaChaptersMemoryCache: jest.fn(),
}));

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

function gemaraPayload() {
  return {
    he: ['אמר רב יהודה', 'אמר שמואל'],
    heTitle: 'ברכות',
    ref: 'Berakhot.2a',
  };
}

function commentaryPayload(text: string) {
  return {
    he: [text, `${text} ב`],
  };
}

function jsonForUrl(url: string): Record<string, unknown> {
  if (url.includes('Rashi_on_')) {
    return commentaryPayload('רש״י');
  }
  if (url.includes('Tosafot_on_')) {
    return commentaryPayload('תוספות');
  }
  if (url.includes('Steinsaltz_on_')) {
    return commentaryPayload('שטיינזלץ');
  }
  return gemaraPayload();
}

function mockNetwork(): void {
  globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    return {
      ok: true,
      json: async () => jsonForUrl(url),
    };
  }) as unknown as typeof fetch;
}

describe('sefariaTextApi', () => {
  beforeEach(() => {
    files.clear();
    invalidateSefariaTextMemoryCache();
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
      },
    );
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    globalThis.fetch = jest.fn(async () => {
      throw new Error('unexpected fetch');
    });
  });

  afterEach(() => {
    invalidateSefariaTextMemoryCache();
  });

  it('fetches gemara and commentators without commentary=1', async () => {
    mockNetwork();

    const page = await fetchSefariaPageText('Berachot', 2, 'a');
    const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) => String(call[0]));

    expect(urls.some((url: string) => url.includes('commentary=0'))).toBe(true);
    expect(urls.some((url: string) => url.includes('commentary=1'))).toBe(false);
    expect(urls.some((url: string) => url.includes('Rashi_on_Berakhot.2a'))).toBe(true);
    expect(urls.some((url: string) => url.includes('Tosafot_on_Berakhot.2a'))).toBe(true);
    expect(urls.some((url: string) => url.includes('Steinsaltz_on_Berakhot.2a'))).toBe(true);
    expect(page.segments.length).toBeGreaterThan(0);
    expect(page.commentaries[0]?.map((item) => item.commentator).sort()).toEqual(
      ['rashi', 'steinsaltz', 'tosafot'].sort(),
    );
  });

  it('starts gemara and commentator fetches before any response is processed', async () => {
    const urls: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(String(input));
      await gate;
      return {
        ok: true,
        json: async () => jsonForUrl(String(input)),
      };
    }) as unknown as typeof fetch;

    const pagePromise = fetchSefariaPageText('Berachot', 2, 'a');
    for (let i = 0; i < 20 && urls.length < 4; i += 1) {
      await Promise.resolve();
    }

    expect(urls).toHaveLength(4);
    expect(urls.some((url) => url.includes('commentary=0'))).toBe(true);
    expect(urls.some((url) => url.includes('Rashi_on_'))).toBe(true);
    expect(urls.some((url) => url.includes('Tosafot_on_'))).toBe(true);
    expect(urls.some((url) => url.includes('Steinsaltz_on_'))).toBe(true);

    release();
    const page = await pagePromise;
    expect(page.segments.length).toBeGreaterThan(0);
  });

  it('shares one in-flight download for the same amud', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      await gate;
      return {
        ok: true,
        json: async () => jsonForUrl(String(input)),
      };
    }) as unknown as typeof fetch;

    const first = fetchSefariaPageText('Berachot', 2, 'a');
    const second = fetchSefariaPageText('Berachot', 2, 'a');
    release();

    const [pageA, pageB] = await Promise.all([first, second]);
    expect(pageA.tref).toBe(pageB.tref);
    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('reads a valid disk cache after memory is cleared', async () => {
    const cached = {
      v: SEFARIA_TEXT_CACHE_VERSION,
      tref: 'Berakhot.2a',
      titleHe: 'ברכות',
      titleEn: 'Berakhot.2a',
      segments: [{ index: 0, ref: 'Berakhot.2a:1', he: 'מהדיסק' }],
      commentaries: {},
      chapterEvents: [],
    };
    const payload = JSON.stringify(cached);
    expect(payload.length).toBeGreaterThan(100);
    files.set('file:///files/sefaria-text/Berakhot_2a.json', payload);

    const page = await fetchSefariaPageText('Berachot', 2, 'a');
    expect(page.segments[0].he).toBe('מהדיסק');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
