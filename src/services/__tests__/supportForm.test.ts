jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 34 },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.2.9',
      extra: {},
    },
  },
}));

import {
  buildSupportFormPayload,
  getSupportFormErrorMessage,
  isSupportFormConfigured,
  resolveSupportFormUrl,
  submitSupportForm,
} from '../supportForm';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';

jest.mock('../../utils/fetchWithTimeout', () => ({
  fetchWithTimeout: jest.fn(),
}));

const Constants = require('expo-constants').default;
const mockedFetch = fetchWithTimeout as jest.MockedFunction<typeof fetchWithTimeout>;

describe('supportForm', () => {
  const previous = process.env.EXPO_PUBLIC_SUPPORT_FORM_URL;

  afterEach(() => {
    Constants.expoConfig.extra = {};
    mockedFetch.mockReset();
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_SUPPORT_FORM_URL;
    } else {
      process.env.EXPO_PUBLIC_SUPPORT_FORM_URL = previous;
    }
  });

  it('reads the worker url from expo extra', () => {
    Constants.expoConfig.extra = { supportFormUrl: 'https://example.workers.dev' };
    delete process.env.EXPO_PUBLIC_SUPPORT_FORM_URL;
    expect(resolveSupportFormUrl()).toBe('https://example.workers.dev');
    expect(isSupportFormConfigured()).toBe(true);
  });

  it('builds a payload with optional contact fields', () => {
    const payload = buildSupportFormPayload({
      category: 'bug',
      message: 'הקורא לא נפתח',
      replyEmail: 'user@example.com',
      phone: '050-123-4567',
    });
    expect(payload).toEqual(
      expect.objectContaining({
        category: 'bug',
        message: 'הקורא לא נפתח',
        replyEmail: 'user@example.com',
        phone: '0501234567',
        appVersion: '1.2.9',
      }),
    );
  });

  it('sends guideTopic instead of a free subject override', () => {
    const payload = buildSupportFormPayload({
      category: 'question',
      message: 'שאלה מהמדריך',
      replyEmail: '',
      phone: '',
      subjectOverride: 'מסע דף, שאלה מהמדריך: סימון חצי דף',
    });
    expect(payload).toEqual(
      expect.objectContaining({
        category: 'question',
        guideTopic: 'סימון חצי דף',
      }),
    );
    expect(payload).not.toHaveProperty('subjectOverride');
  });

  it('returns null when validation fails', () => {
    expect(
      buildSupportFormPayload({
        category: 'bug',
        message: '',
        replyEmail: '',
        phone: '',
      }),
    ).toBeNull();
  });

  it('maps missing configuration and rate limits', async () => {
    delete process.env.EXPO_PUBLIC_SUPPORT_FORM_URL;
    Constants.expoConfig.extra = {};
    await expect(
      submitSupportForm({
        category: 'bug',
        message: 'באג',
        appVersion: '1.2.9',
        platform: 'android 34',
      }),
    ).resolves.toEqual({ ok: false, error: 'not_configured' });

    Constants.expoConfig.extra = { supportFormUrl: 'https://example.workers.dev' };
    mockedFetch.mockResolvedValue({ ok: false, status: 429 } as Response);
    await expect(
      submitSupportForm({
        category: 'bug',
        message: 'באג',
        appVersion: '1.2.9',
        platform: 'android 34',
      }),
    ).resolves.toEqual({ ok: false, error: 'rate_limited' });

    expect(getSupportFormErrorMessage('rate_limited')).toContain('מגבלת השליחה');
  });

  it('returns ok on successful submit', async () => {
    Constants.expoConfig.extra = { supportFormUrl: 'https://example.workers.dev' };
    mockedFetch.mockResolvedValue({ ok: true, status: 200 } as Response);
    await expect(
      submitSupportForm({
        category: 'suggestion',
        message: 'הצעה יפה',
        appVersion: '1.2.9',
        platform: 'android 34',
      }),
    ).resolves.toEqual({ ok: true });
  });

  it('includes optional image attachments in the request body', async () => {
    Constants.expoConfig.extra = { supportFormUrl: 'https://example.workers.dev' };
    mockedFetch.mockResolvedValue({ ok: true, status: 200 } as Response);
    await expect(
      submitSupportForm({
        category: 'bug',
        message: 'באג עם צילום',
        appVersion: '1.2.9',
        platform: 'android 34',
        attachments: [
          {
            filename: 'screenshot.jpg',
            contentType: 'image/jpeg',
            contentBase64: 'AAAA',
          },
        ],
      }),
    ).resolves.toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://example.workers.dev',
      expect.objectContaining({
        body: expect.stringContaining('"contentBase64":"AAAA"'),
      }),
      60000,
    );
  });
});
