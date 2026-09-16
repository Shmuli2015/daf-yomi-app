const fs = require('fs');
const path = require('path');

const MARKER = '<!-- app-notes-end -->';

function loadWhatsNewEntries() {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'whatsNew.ts');
  const src = fs.readFileSync(filePath, 'utf8');
  const key = 'export const WHATS_NEW';
  const keyAt = src.indexOf(key);
  if (keyAt < 0) {
    throw new Error('WHATS_NEW not found in src/data/whatsNew.ts');
  }
  const eq = src.indexOf('=', keyAt);
  const start = src.indexOf('[', eq);
  if (eq < 0 || start < 0) {
    throw new Error('WHATS_NEW array not found');
  }
  let depth = 0;
  for (let i = start; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        const literal = src.slice(start, i + 1);
        return new Function(`return (${literal})`)();
      }
    }
  }
  throw new Error('WHATS_NEW array is not closed');
}

function hasWhatsNewEntry(version) {
  const normalized = String(version).trim().replace(/^v/i, '');
  const entries = loadWhatsNewEntries();
  return entries.some(entry => entry && entry.version === normalized);
}

function formatWhatsNewReleaseBody(version) {
  const normalized = String(version).trim().replace(/^v/i, '');
  const entries = loadWhatsNewEntries();
  const entry = entries.find(item => item && item.version === normalized);
  const highlights = (entry?.highlights ?? []).map(item => String(item).trim()).filter(Boolean);
  if (!highlights.length) {
    return `${MARKER}\n`;
  }
  const bullets = highlights.map(item => `- ${item}`).join('\n');
  return `## מה חדש\n${bullets}\n\n${MARKER}\n`;
}

module.exports = {
  loadWhatsNewEntries,
  hasWhatsNewEntry,
  formatWhatsNewReleaseBody,
};
