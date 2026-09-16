import { buildDownloadShareContent, DOWNLOAD_SHARE_TITLE, getDownloadShareBody } from '../shareDownloadLink';

const URL = 'https://example.com/download/';

describe('shareDownloadLink', () => {
  it('builds a detailed Hebrew body without the url', () => {
    const body = getDownloadShareBody();
    expect(body).toContain('מסע דף - אפליקציית מעקב לדף היומי.');
    expect(body).toContain('מעקב ברור אחרי הדף, הרצף והש״ס');
    expect(body).toContain('תזכורות יומיות');
    expect(body).toContain('בלי חשבון ובלי פרסומות');
    expect(body).toContain('הורדה לאנדרואיד:');
    expect(body).not.toContain(URL);
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
