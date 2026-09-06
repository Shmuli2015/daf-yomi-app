const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function run(command) {
  console.log(`\x1b[36m> ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', shell: true, cwd: rootDir });
}

function runQuiet(command) {
  return execSync(command, { cwd: rootDir, encoding: 'utf-8' }).trim();
}

function readVersion() {
  delete require.cache[require.resolve('../package.json')];
  return require('../package.json').version;
}

console.log('\x1b[1m🚀 Starting release preparation...\x1b[0m\n');

const status = runQuiet('git status --porcelain');
if (status) {
  console.error('\x1b[31m❌ Error: Git working tree is not clean. Please commit or stash changes before releasing.\x1b[0m');
  process.exit(1);
}

const currentBranch = runQuiet('git rev-parse --abbrev-ref HEAD');
if (currentBranch !== 'master') {
  console.warn(`\x1b[33m⚠️  Warning: Currently on branch '${currentBranch}'. Releases are recommended from 'master'.\x1b[0m`);
}

console.log('\n\x1b[1m🔍 Running CI checks (typecheck, tests, expo-doctor)...\x1b[0m');
run('npm run ci');

const releaseType = process.argv[2] || 'patch';
console.log(`\n\x1b[1m📦 Bumping version (${releaseType})...\x1b[0m`);
run(`npm version ${releaseType} --no-git-tag-version`);

const version = readVersion();
const branch = `release/${version}`;

console.log(`\n\x1b[1m🌿 Creating branch ${branch}...\x1b[0m`);
run(`git checkout -b ${branch}`);
run('git add package.json package-lock.json');
run(`git commit -m "Release ${version}"`);
run('git push -u origin HEAD');

console.log('\n\x1b[1m📝 Opening PR to master...\x1b[0m');
try {
  run(`gh pr create --title "Release ${version}" --body "Automated release PR for version ${version}." --base master`);
} catch (error) {
  console.warn('\n\x1b[33mNote: GitHub CLI (gh) command failed or is not installed. You can open the PR manually on GitHub.\x1b[0m');
}

console.log(`\n\x1b[32m✨ Release ${version} initiated!\x1b[0m`);
console.log(`Branch ${branch} was pushed. The APK build and GitHub Release are now running in GitHub Actions.`);
console.log(`Once built, merge the PR to keep master updated.\n`);
