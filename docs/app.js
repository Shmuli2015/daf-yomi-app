const GITHUB_OWNER = 'Shmuli2015';
const GITHUB_REPO = 'daf-yomi-app';
const APK_BASENAME = 'masa-daf';
const GITHUB_API_TIMEOUT_MS = 4000;
const LATEST_JSON_TIMEOUT_MS = 8000;

const versionLine = document.getElementById('version-line');
const downloadBtn = document.getElementById('download-btn');
const downloadBtnVersion = document.getElementById('download-btn-version');
const statusEl = document.getElementById('status');

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

function applyRelease({ version, downloadUrl, apkFileName }) {
  releaseDownloadUrl = downloadUrl;
  releaseApkFileName = apkFileName || '';
  versionLine.hidden = true;

  if (downloadBtnVersion) {
    downloadBtnVersion.textContent = `גרסה ${version}`;
  }

  downloadBtn.href = downloadUrl;
  downloadBtn.removeAttribute('target');
  downloadBtn.setAttribute('download', releaseApkFileName || `${APK_BASENAME}.apk`);
  downloadBtn.setAttribute('rel', 'noopener noreferrer');
  downloadBtn.removeAttribute('aria-disabled');
  statusEl.textContent = '';
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadLatestJson() {
  const res = await fetchWithTimeout('latest.json', { cache: 'no-store' }, LATEST_JSON_TIMEOUT_MS);
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
  const res = await fetchWithTimeout(
    url,
    { headers: { Accept: 'application/vnd.github+json' } },
    GITHUB_API_TIMEOUT_MS,
  );
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

async function loadRelease() {
  try {
    return await loadLatestJson();
  } catch {
    return await loadFromGithubApi();
  }
}

function handleDownloadClick(event) {
  if (downloadBtn.getAttribute('aria-disabled') === 'true' || !releaseDownloadUrl) {
    event.preventDefault();
    return;
  }

  statusEl.textContent =
    'ההורדה החלה. אם מופיעה הודעה שהקובץ עלול להזיק, לחצו על "הורדה בכל זאת".';
}

downloadBtn?.addEventListener('click', handleDownloadClick);

async function init() {
  downloadBtn.setAttribute('aria-disabled', 'true');
  try {
    const release = await loadRelease();
    applyRelease(release);
  } catch {
    versionLine.hidden = false;
    versionLine.textContent = 'לא הצלחנו לטעון את הגרסה';
    statusEl.textContent = 'נסו שוב מאוחר יותר, או פנו לתמיכה.';
  }
}

init();
