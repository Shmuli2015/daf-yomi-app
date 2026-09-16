export const DOWNLOAD_SHARE_TITLE = 'מסע דף';

export type SharePlatform = 'ios' | 'android' | 'windows' | 'macos' | 'web';

export function getDownloadShareBody(): string {
  return [
    'מסע דף - אפליקציית מעקב לדף היומי.',
    '',
    'מעקב ברור אחרי הדף, הרצף והש״ס, עם תזכורות יומיות וטקסטים בעברית.',
    'הכל נשמר במכשיר בלבד, בלי חשבון ובלי פרסומות.',
    '',
    'הורדה לאנדרואיד:',
  ].join('\n');
}

export function buildDownloadShareContent(
  url: string,
  os: SharePlatform,
): { title: string; message: string; url?: string } {
  const body = getDownloadShareBody();
  if (os === 'ios') {
    return { title: DOWNLOAD_SHARE_TITLE, message: body, url };
  }
  return { title: DOWNLOAD_SHARE_TITLE, message: `${body}\n${url}` };
}
