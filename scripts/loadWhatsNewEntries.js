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

function formatWhatsNewReleaseBody(_version) {
  const entries = loadWhatsNewEntries();
  const sorted = [...entries].sort((left, right) => {
    const parse = raw => {
      const core = String(raw).trim().replace(/^v/i, '').split('-')[0] ?? '';
      const parts = core.split('.').map(part => parseInt(part, 10));
      return [
        Number.isFinite(parts[0]) ? parts[0] : 0,
        Number.isFinite(parts[1]) ? parts[1] : 0,
        Number.isFinite(parts[2]) ? parts[2] : 0,
      ];
    };
    const [a1, a2, a3] = parse(right.version);
    const [b1, b2, b3] = parse(left.version);
    if (a1 !== b1) return a1 - b1;
    if (a2 !== b2) return a2 - b2;
    return a3 - b3;
  });
  const highlights = [];
  const seen = new Set();
  for (const entry of sorted) {
    for (const item of (entry?.highlights ?? []).map(text => String(text).trim()).filter(Boolean)) {
      if (seen.has(item)) continue;
      seen.add(item);
      highlights.push(item);
      if (highlights.length >= 8) break;
    }
    if (highlights.length >= 8) break;
  }
  if (!highlights.length) {
    return `${MARKER}\n`;
  }
  const bullets = highlights.map(item => `- ${item}`).join('\n');
  return `## מה חדש\n${bullets}\n\n${MARKER}\n`;
}

const PLAY_WHATS_NEW_MAX_CHARS = 500;

function getHighlightsForVersion(version) {
  const normalized = String(version).trim().replace(/^v/i, '');
  const entries = loadWhatsNewEntries();
  const entry = entries.find(item => item && item.version === normalized);
  return (entry?.highlights ?? []).map(text => String(text).trim()).filter(Boolean);
}

function formatPlayWhatsNewText(version) {
  const highlights = getHighlightsForVersion(version);
  if (!highlights.length) {
    return '';
  }
  const lines = [];
  let length = 0;
  for (const item of highlights) {
    const line = `• ${item}`;
    const nextLength = length === 0 ? line.length : length + 1 + line.length;
    if (nextLength > PLAY_WHATS_NEW_MAX_CHARS) {
      break;
    }
    lines.push(line);
    length = nextLength;
  }
  return lines.join('\n');
}

module.exports = {
  loadWhatsNewEntries,
  hasWhatsNewEntry,
  formatWhatsNewReleaseBody,
  formatPlayWhatsNewText,
  PLAY_WHATS_NEW_MAX_CHARS,
};
