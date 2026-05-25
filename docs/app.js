const GITHUB_OWNER = 'Shmuli2015';
const GITHUB_REPO = 'daf-yomi-app';
const APK_BASENAME = 'masa-daf';

const versionLine = document.getElementById('version-line');
const downloadBtn = document.getElementById('download-btn');
const downloadBtnVersion = document.getElementById('download-btn-version');
const statusEl = document.getElementById('status');
const inAppBanner = document.getElementById('in-app-banner');
const openExternalBtn = document.getElementById('open-external-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');

let releaseDownloadUrl = '';
let releaseApkFileName = '';

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

  // Opens the system "Open with" chooser — breaks out of in-app browsers.
  window.location.href = `intent://${path}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end`;
}

async function copyPageLink() {
  const url = window.location.href;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    statusEl.textContent = 'הקישור הועתק. הדביקו ב-Chrome ופתחו מהדפדפן.';
  } catch {
    statusEl.textContent = 'לא הצלחנו להעתיק. ⋮ → «פתיחה בדפדפן».';
  }
}

function showInAppUi() {
  if (inAppBanner) inAppBanner.hidden = false;
  if (downloadBtn) downloadBtn.hidden = true;
  statusEl.textContent = '';
}

function hideInAppUi() {
  if (inAppBanner) inAppBanner.hidden = true;
  if (downloadBtn) downloadBtn.hidden = false;
}

function downloadApkDirect(url) {
  statusEl.textContent = 'מתחיל הורדה…';
  window.location.assign(url);
}

function applyRelease({ version, downloadUrl, apkFileName }) {
  releaseDownloadUrl = downloadUrl;
  releaseApkFileName = apkFileName || '';
  versionLine.hidden = true;

  if (downloadBtnVersion) {
    downloadBtnVersion.textContent = `גרסה ${version}`;
  }
  downloadBtn.removeAttribute('aria-disabled');

  if (isAndroid()) {
    downloadBtn.href = '#';
  } else {
    downloadBtn.href = downloadUrl;
    downloadBtn.hidden = false;
  }

  if (needsExternalBrowser()) {
    showInAppUi();
  } else {
    hideInAppUi();
    statusEl.textContent = '';
  }
}

async function loadLatestJson() {
  const res = await fetch('latest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('latest.json unavailable');
  const data = await res.json();
  if (!data?.downloadUrl || !data?.version) throw new Error('invalid latest.json');
  return {
    version: data.version,
    downloadUrl: data.downloadUrl,
    apkFileName: data.apkFileName || '',
  };
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
    downloadUrl: asset?.browser_download_url || buildDownloadUrl(tag, fileName),
    apkFileName: fileName,
  };
}

function handleDownloadClick(event) {
  if (!releaseDownloadUrl) return;
  if (!isAndroid()) return;

  event.preventDefault();

  if (needsExternalBrowser()) {
    openInExternalBrowser(window.location.href);
    return;
  }

  downloadApkDirect(releaseDownloadUrl);
}

openExternalBtn?.addEventListener('click', () => {
  openInExternalBrowser(window.location.href);
});

copyLinkBtn?.addEventListener('click', copyPageLink);

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
