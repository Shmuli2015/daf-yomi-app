const fs = require('fs');
const path = require('path');
const { formatWhatsNewReleaseBody } = require('./loadWhatsNewEntries');

const version = require('../package.json').version;
const outPath = path.join(__dirname, '..', 'whats-new-release-body.md');
fs.writeFileSync(outPath, formatWhatsNewReleaseBody(version), 'utf8');
console.log(`Wrote Whats New release body for ${version} to ${outPath}`);
