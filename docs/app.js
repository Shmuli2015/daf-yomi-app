const GITHUB_OWNER = 'Shmuli2015';
const GITHUB_REPO = 'daf-yomi-app';
const APK_BASENAME = 'masa-daf';

const versionLine = document.getElementById('version-line');
const downloadBtn = document.getElementById('download-btn');
const downloadBtnVersion = document.getElementById('download-btn-version');
const statusEl = document.getElementById('status');
const inAppBanner = document.getElementById('in-app-banner');
const openExternalBtn = document.getElementById('open-external-btn');

let releaseDownloadUrl = '';

function normalizeVersion(raw) {
  return String(raw || '')
    .trim()
    .replace(/^v/i, '');
}

function pickApkAsset(assets) {
  if (!Array.isArray(assets)) return null;
  const apks = assets.filter(a => a?.name?.endsWith('.apk'));
  if (!apks.length) return null;
  const prefix = `${APK_BASENAME}-`;
  return apks.find(a => a.name.startsWith(prefix)) ?? apks[0];
}

function buildDownloadUrl(tag, fileName) {
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(fileName)}`;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent || '');
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return (
    /Instagram|WhatsApp|FBAN|FBAV|FB_IAB|FB4A|Line\/|Twitter|LinkedInApp|Snapchat|TikTok|Telegram|Messenger|MicroMessenger/i.test(
      ua
    ) || (isAndroid() && (/\bwv\b|WebView|; wv\)/.test(ua)))
  );
}

function cameFromInAppReferrer() {
  const ref = document.referrer || '';
  return /whatsapp|facebook|instagram|messenger|t\.me|telegram|twitter|x\.com|tiktok|snapchat|linkedin/i.test(
    ref
  );
}

function isStandaloneAndroidBrowser() {
  const ua = navigator.userAgent || '';
  if (!isAndroid() || isInAppBrowser()) return false;
  if (/\bwv\b|WebView|; wv\)/.test(ua)) return false;
  return /Chrome\/|Firefox\/|SamsungBrowser\/|EdgA\//.test(ua);
}

function needsExternalBrowser() {
  if (!isAndroid()) return false;
  if (isInAppBrowser() || cameFromInAppReferrer()) return true;
  return !isStandaloneAndroidBrowser();
}

function openInExternalBrowser(url) {
  const target = url || window.location.href;
  const path = target.replace(/^https?:\/\//, '');
  const fallback = encodeURIComponent(target);
  window.location.href = `intent://${path}#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

function showInAppUi() {
  if (inAppBanner) inAppBanner.hidden = false;
  statusEl.textContent = 'לחצו על «פתחו ב-Chrome» או על «הורד לאנדרואיד» כדי לעבור לדפדפן מלא.';
}

function applyRelease({ version, downloadUrl }) {
  releaseDownloadUrl = downloadUrl;
  versionLine.hidden = true;
  downloadBtn.href = isAndroid() ? '#' : downloadUrl;
  if (downloadBtnVersion) {
    downloadBtnVersion.textContent = `גרסה ${version}`;
  }
  downloadBtn.hidden = false;
  downloadBtn.removeAttribute('aria-disabled');

  if (needsExternalBrowser()) {
    showInAppUi();
  } else {
    statusEl.textContent = '';
  }
}

async function loadLatestJson() {
  const res = await fetch('latest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('latest.json unavailable');
  const data = await res.json();
  if (!data?.downloadUrl || !data?.version) throw new Error('invalid latest.json');
  return { version: data.version, downloadUrl: data.downloadUrl };
}

async function loadFromGithubApi() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('GitHub API failed');
  const release = await res.json();
  const tag = release?.tag_name;
  const asset = pickApkAsset(release?.assets);
  const fileName = asset?.name?.trim();
  if (!tag || !fileName) throw new Error('no APK on release');
  return {
    version: normalizeVersion(tag),
    downloadUrl: buildDownloadUrl(tag, fileName),
  };
}

function handleDownloadClick(event) {
  if (!releaseDownloadUrl) return;

  if (!isAndroid()) return;

  event.preventDefault();

  if (needsExternalBrowser()) {
    openInExternalBrowser(window.location.href);
    statusEl.textContent = 'אחרי שנפתח Chrome, לחצו שוב על «הורד לאנדרואיד».';
    return;
  }

  window.location.href = releaseDownloadUrl;
}

openExternalBtn?.addEventListener('click', () => {
  openInExternalBrowser(window.location.href);
  statusEl.textContent = 'אחרי שנפתח Chrome, לחצו שוב על «הורד לאנדרואיד».';
});

downloadBtn?.addEventListener('click', handleDownloadClick);

async function init() {
  downloadBtn.setAttribute('aria-disabled', 'true');
  try {
    const release = (await loadFromGithubApi().catch(() => null)) ?? (await loadLatestJson());
    applyRelease(release);
  } catch {
    versionLine.textContent = 'לא הצלחנו לטעון את הגרסה';
    statusEl.textContent = 'נסו שוב מאוחר יותר, או פנו לתמיכה.';
  }
}

init();
