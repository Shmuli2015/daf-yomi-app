import Constants from 'expo-constants';

export type AppExtraConfig = {
  githubOwner?: string;
  githubRepo?: string;
  releaseApkBasename?: string;
  updateCheckEnabled?: boolean;
};

export type LatestReleaseOffer = {
  latestVersion: string;
  downloadUrl: string;
  rawTag: string;
  /** שם קובץ ה-APK ב-release (לאימות מול ההורדה) */
  apkFileName: string;
};

type GithubAsset = {
  name?: string;
  browser_download_url?: string;
};

type GithubReleaseJson = {
  tag_name?: string;
  assets?: GithubAsset[];
};

export function getAppExtra(): AppExtraConfig {
  return (Constants.expoConfig?.extra ?? {}) as AppExtraConfig;
}

export function isUpdateCheckConfigured(extra = getAppExtra()): boolean {
  return !!(
    extra.updateCheckEnabled !== false &&
    extra.githubOwner &&
    extra.githubRepo &&
    extra.releaseApkBasename
  );
}

/** Strip leading "v" from tag names */
export function normalizeVersionString(raw: string): string {
  return raw.trim().replace(/^v/i, '');
}

/** Numeric semver tuple for comparison (major, minor, patch only). */
export function parseSemverParts(version: string): [number, number, number] {
  const core = normalizeVersionString(version).split('-')[0] ?? '';
  const parts = core.split('.').map(p => parseInt(p, 10));
  const a = Number.isFinite(parts[0]) ? parts[0] : 0;
  const b = Number.isFinite(parts[1]) ? parts[1] : 0;
  const c = Number.isFinite(parts[2]) ? parts[2] : 0;
  return [a, b, c];
}

/** Positive if a > b */
export function compareSemver(a: string, b: string): number {
  const [a1, a2, a3] = parseSemverParts(a);
  const [b1, b2, b3] = parseSemverParts(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

/**
 * בוחר את נכס ה-APK: קודם לפי קידומת masa-daf-, אחרת קובץ .apk ראשון בתוצאת ה-API.
 */
export function pickApkAsset(
  assets: GithubAsset[] | undefined,
  releaseApkBasename: string,
): GithubAsset | null {
  if (!assets?.length) return null;
  const apkRows = assets.filter(a => a?.name?.endsWith('.apk'));
  if (!apkRows.length) return null;
  const prefix = `${releaseApkBasename}-`;
  const preferred = apkRows.find(a => (a.name as string).startsWith(prefix));
  return preferred ?? apkRows[0];
}

/**
 * קישור הורדה יציב ל-GitHub (לא תלוי ב-browser_download_url מה-API שעלול להיות מבלבל).
 * פורמט: https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
 */
export function buildGithubReleaseDownloadUrl(
  owner: string,
  repo: string,
  tagName: string,
  assetFileName: string,
): string {
  const encOwner = encodeURIComponent(owner).replace(/%2F/g, '');
  const encRepo = encodeURIComponent(repo).replace(/%2F/g, '');
  return `https://github.com/${encOwner}/${encRepo}/releases/download/${encodeURIComponent(tagName)}/${encodeURIComponent(assetFileName)}`;
}

function resolveApkDownloadUrl(
  owner: string,
  repo: string,
  tagName: string,
  asset: GithubAsset,
): string | null {
  const fileName = asset.name?.trim();
  if (!fileName?.endsWith('.apk')) return null;
  return buildGithubReleaseDownloadUrl(owner, repo, tagName, fileName);
}

export async function fetchLatestGitHubRelease(
  owner: string,
  repo: string,
): Promise<GithubReleaseJson | null> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MasaDaf-Android',
      },
    });
    if (!res.ok) {
      // 404 = אין עדיין Release מפורסם בריפו — צפוי לפני טאג/פרסום ראשון
      if (__DEV__ && res.status !== 404) {
        console.warn('[appUpdate] releases/latest HTTP', res.status);
      }
      return null;
    }
    return (await res.json()) as GithubReleaseJson;
  } catch (e) {
    if (__DEV__) console.warn('[appUpdate] fetch failed', e);
    return null;
  }
}

/** Resolved offer only when remote is newer than installedVersion */
export async function resolveUpdateOfferIfAny(installedVersion: string): Promise<LatestReleaseOffer | null> {
  const extra = getAppExtra();
  if (!isUpdateCheckConfigured(extra)) return null;
  const { githubOwner: owner, githubRepo: repo, releaseApkBasename: basename } = extra;
  if (!owner || !repo || !basename) return null;

  const release = await fetchLatestGitHubRelease(owner, repo);
  const tag = release?.tag_name;
  if (!tag) return null;

  const latestVersion = normalizeVersionString(tag);
  if (compareSemver(latestVersion, installedVersion) <= 0) return null;

  const asset = pickApkAsset(release.assets, basename);
  const apkFileName = asset?.name?.trim() ?? '';
  const downloadUrl = asset ? resolveApkDownloadUrl(owner, repo, tag, asset) : null;
  if (!downloadUrl || !apkFileName) {
    if (__DEV__) console.warn('[appUpdate] no .apk asset on release', tag);
    return null;
  }

  if (__DEV__) {
    console.log('[appUpdate] newer release', {
      installedVersion,
      latestVersion,
      tag,
      apkFileName,
      downloadUrl,
    });
  }

  return { latestVersion, downloadUrl, rawTag: tag, apkFileName };
}

export async function probeLatestReleaseForDev(): Promise<{
  tag_name?: string;
  apkAsset?: string;
  ok: boolean;
  detail?: string;
}> {
  const extra = getAppExtra();
  if (!extra.githubOwner || !extra.githubRepo) {
    return { ok: false, detail: 'חסר githubOwner/githubRepo ב-expo.extra' };
  }
  const release = await fetchLatestGitHubRelease(extra.githubOwner, extra.githubRepo);
  if (!release?.tag_name) {
    return { ok: false, detail: 'לא התקבלה תגובה תקינה מ-GitHub' };
  }
  const basename = extra.releaseApkBasename ?? '';
  const apkNames =
    release.assets?.filter(a => a.name?.endsWith('.apk')).map(a => a.name as string) ?? [];
  const picked = basename ? pickApkAsset(release.assets, basename) : null;
  const chosenName = picked?.name?.trim();
  const chosenUrl =
    chosenName && release.tag_name
      ? buildGithubReleaseDownloadUrl(extra.githubOwner, extra.githubRepo, release.tag_name, chosenName)
      : null;

  let detail: string;
  if (chosenUrl && chosenName) {
    detail = `נבחר: ${chosenName}`;
  } else if (apkNames.length) {
    detail = `APK ב-release: ${apkNames.join(', ')}`;
  } else {
    detail = 'אין נכס .apk ב-release';
  }

  return {
    ok: true,
    tag_name: release.tag_name,
    apkAsset: chosenName ?? (apkNames.length ? apkNames.join(', ') : undefined),
    detail,
  };
}
