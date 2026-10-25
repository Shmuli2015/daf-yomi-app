function normalizeVersionName(raw) {
  return String(raw || '').trim().replace(/^v/i, '');
}

function versionNamesMatch(releaseName, version) {
  const wanted = normalizeVersionName(version);
  const name = normalizeVersionName(releaseName);
  if (!wanted || !name) return false;
  return name === wanted || name.endsWith(` ${wanted}`) || name.endsWith(`-${wanted}`);
}

function pickAlphaRelease(releases, version) {
  const list = Array.isArray(releases) ? releases : [];
  const withCodes = list.filter(release => Array.isArray(release?.versionCodes) && release.versionCodes.length > 0);
  const named = withCodes.find(release => versionNamesMatch(release.name, version));
  if (named) return named;
  const completed = withCodes.find(release => release.status === 'completed' || release.status === 'inProgress');
  if (completed) return completed;
  throw new Error(`No alpha release found for ${normalizeVersionName(version) || 'the requested version'}.`);
}

function buildProductionTrack(release, notes, version) {
  const text = String(notes || '').trim();
  if (!text) {
    throw new Error(`Missing Play what's new text for ${normalizeVersionName(version)}.`);
  }
  const versionCodes = (release?.versionCodes || []).map(code => String(code));
  if (!versionCodes.length) {
    throw new Error('Alpha release has no version codes.');
  }
  return {
    releases: [
      {
        name: normalizeVersionName(version),
        versionCodes,
        status: 'completed',
        releaseNotes: [{ language: 'he-IL', text }],
      },
    ],
  };
}

module.exports = {
  normalizeVersionName,
  versionNamesMatch,
  pickAlphaRelease,
  buildProductionTrack,
};
