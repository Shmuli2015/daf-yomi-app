const fs = require('fs');
const path = require('path');
const { formatPlayWhatsNewText } = require('./loadWhatsNewEntries');

const version = require('../package.json').version;
const outDir = path.join(__dirname, '..', 'play-whatsnew');
const outPath = path.join(outDir, 'whatsnew-he-IL');
const text = formatPlayWhatsNewText(version);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, text, 'utf8');
console.log(
  text
    ? `Wrote Play whats-new for ${version} (${text.length} chars) to ${outPath}`
    : `Wrote empty Play whats-new for ${version} to ${outPath}`,
);
