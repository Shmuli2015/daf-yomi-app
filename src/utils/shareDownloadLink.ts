export const DOWNLOAD_SHARE_TITLE = 'מסע דף';

export const PLAY_STORE_APP_URL =
  'https://play.google.com/store/apps/details?id=com.masadaf.app';

export type SharePlatform = 'ios' | 'android' | 'windows' | 'macos' | 'web';

export type DownloadShareChannel = 'play' | 'apk';

export function getDownloadShareBody(channel: DownloadShareChannel = 'apk'): string {
  const closing =
    channel === 'play' ? 'התקנה מגוגל פליי:' : 'התקנה מגוגל פליי, או הורדת קובץ לאנדרואיד:';
  return [
    'מסע דף - אפליקציית מעקב לדף היומי.',
    '',
    'מעקב ברור אחרי הדף, הרצף והש״ס, עם תזכורות יומיות וקריאה בגמרא.',
    'הכל נשמר במכשיר בלבד, בלי חשבון ובלי פרסומות.',
    '',
    closing,
  ].join('\n');
}

export function buildDownloadShareContent(
  url: string,
  os: SharePlatform,
  channel: DownloadShareChannel = 'apk',
): { title: string; message: string; url?: string } {
  const body = getDownloadShareBody(channel);
  if (os === 'ios') {
    return { title: DOWNLOAD_SHARE_TITLE, message: body, url };
  }
  return { title: DOWNLOAD_SHARE_TITLE, message: `${body}\n${url}` };
}
