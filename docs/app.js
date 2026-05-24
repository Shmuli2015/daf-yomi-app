const GITHUB_OWNER = 'Shmuli2015';
const GITHUB_REPO = 'daf-yomi-app';
const APK_BASENAME = 'masa-daf';

const versionLine = document.getElementById('version-line');
const downloadBtn = document.getElementById('download-btn');
const downloadBtnVersion = document.getElementById('download-btn-version');
const statusEl = document.getElementById('status');

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

function applyRelease({ version, downloadUrl }) {
  versionLine.hidden = true;
  downloadBtn.href = downloadUrl;
  if (downloadBtnVersion) {
    downloadBtnVersion.textContent = `גרסה ${version}`;
  }
  downloadBtn.hidden = false;
  downloadBtn.removeAttribute('aria-disabled');
  statusEl.textContent = '';
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
