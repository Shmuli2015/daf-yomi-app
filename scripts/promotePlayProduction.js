const crypto = require('crypto');
const { formatPlayWhatsNewText } = require('./loadWhatsNewEntries');
const { buildProductionTrack, normalizeVersionName, pickAlphaRelease } = require('./promotePlayRelease');

const PACKAGE_NAME = 'com.masadaf.app';
const PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function fetchAccessToken(account) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: account.client_email,
    scope: PUBLISHER_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString('base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token request failed (${response.status}).`);
  }
  const body = await response.json();
  if (!body.access_token) {
    throw new Error('Google token response did not include an access token.');
  }
  return body.access_token;
}

async function publisher(token, method, path, payload) {
  const response = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Play API ${method} ${path} failed (${response.status}).`);
  }
  return text ? JSON.parse(text) : {};
}

function readServiceAccount() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw || !raw.trim()) {
    throw new Error('Missing GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.');
  }
  const account = JSON.parse(raw);
  if (!account.client_email || !account.private_key) {
    throw new Error('Play service account JSON is missing client_email or private_key.');
  }
  return account;
}

function readVersion() {
  const fromInput = normalizeVersionName(process.env.PLAY_PROMOTE_VERSION);
  if (fromInput) return fromInput;
  return normalizeVersionName(require('../package.json').version);
}

async function promotePlayProduction() {
  const version = readVersion();
  const notes = formatPlayWhatsNewText(version);
  const account = readServiceAccount();
  const token = await fetchAccessToken(account);
  const edit = await publisher(token, 'POST', '/edits', {});
  const alpha = await publisher(token, 'GET', `/edits/${edit.id}/tracks/alpha`);
  const release = pickAlphaRelease(alpha.releases, version);
  const track = buildProductionTrack(release, notes, version);
  await publisher(token, 'PUT', `/edits/${edit.id}/tracks/production`, track);
  await publisher(token, 'POST', `/edits/${edit.id}:commit`);
  const codes = release.versionCodes.join(', ');
  console.log(`Promoted ${version} (version codes ${codes}) to production with Hebrew what's new.`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = require('fs');
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Play production\n- Version: \`${version}\`\n- Version codes: \`${codes}\`\n- What's new: attached from whatsNew.ts\n`,
    );
  }
}

if (require.main === module) {
  promotePlayProduction().catch(error => {
    console.error(error instanceof Error ? error.message : 'Play promotion failed.');
    process.exit(1);
  });
}

module.exports = {
  promotePlayProduction,
};
