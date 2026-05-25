const { execSync } = require('child_process');
const path = require('path');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', shell: true, cwd: path.join(__dirname, '..') });
}

function readVersion() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require('../package.json').version;
}

run('npm version patch --no-git-tag-version');

const version = readVersion();
const branch = `release/${version}`;

run(`git checkout -b ${branch}`);
run('git add package.json package-lock.json');
run(`git commit -m "Release ${version}"`);
run('git push -u origin HEAD');

console.log(`\nRelease ${version} pushed on branch ${branch}.`);
