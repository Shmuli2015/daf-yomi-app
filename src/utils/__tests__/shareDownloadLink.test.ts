import {
  buildDownloadShareContent,
  DOWNLOAD_SHARE_TITLE,
  getDownloadShareBody,
  PLAY_STORE_APP_URL,
} from '../shareDownloadLink';

const URL = 'https://example.com/download/';

describe('shareDownloadLink', () => {
  it('builds a detailed Hebrew body without the url', () => {
    const body = getDownloadShareBody();
    expect(body).toContain('מסע דף - אפליקציית מעקב לדף היומי.');
    expect(body).toContain('מעקב ברור אחרי הדף, הרצף והש״ס');
    expect(body).toContain('תזכורות יומיות');
    expect(body).toContain('קריאה בגמרא');
    expect(body).toContain('בלי חשבון ובלי פרסומות');
    expect(body).toContain('התקנה מגוגל פליי, או הורדת קובץ לאנדרואיד:');
    expect(body).not.toContain(URL);
  });

  it('points a store install at Google Play only', () => {
    const body = getDownloadShareBody('play');
    expect(body).toContain('התקנה מגוגל פליי:');
    expect(body).not.toContain('הורדת קובץ');
    const content = buildDownloadShareContent(PLAY_STORE_APP_URL, 'android', 'play');
    expect(content.message).toBe(`${body}\n${PLAY_STORE_APP_URL}`);
  });

  it('puts the url only in the android message', () => {
    const content = buildDownloadShareContent(URL, 'android');
    expect(content).toEqual({
      title: DOWNLOAD_SHARE_TITLE,
      message: `${getDownloadShareBody()}\n${URL}`,
    });
  });

  it('keeps the url in a dedicated field on ios', () => {
    const content = buildDownloadShareContent(URL, 'ios');
    expect(content).toEqual({
      title: DOWNLOAD_SHARE_TITLE,
      message: getDownloadShareBody(),
      url: URL,
    });
  });
});
