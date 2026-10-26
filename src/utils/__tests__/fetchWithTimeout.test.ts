import { fetchWithTimeout } from '../fetchWithTimeout';

describe('fetchWithTimeout', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('resolves when fetch completes before timeout', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    globalThis.fetch = jest.fn().mockResolvedValue(mockResponse);

    const res = await fetchWithTimeout('https://example.com/test', {}, 5000);
    expect(res).toBe(mockResponse);
  });

  it('aborts when timeout is reached', async () => {
    jest.useFakeTimers();

    globalThis.fetch = jest.fn().mockImplementation((_url, init) => {
      return new Promise((resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    const promise = fetchWithTimeout('https://example.com/slow', {}, 1000);
    jest.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Aborted');
  });

  it('propagates external abort signal', async () => {
    const controller = new AbortController();
    globalThis.fetch = jest.fn().mockImplementation((_url, init) => {
      return new Promise((resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    const promise = fetchWithTimeout('https://example.com/test', { signal: controller.signal }, 10000);
    controller.abort();

    await expect(promise).rejects.toThrow('Aborted');
  });
});
