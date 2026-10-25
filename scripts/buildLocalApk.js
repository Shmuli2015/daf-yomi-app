const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const rootDir = path.join(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const outputDir = path.join(rootDir, 'local-builds');
const supportedProfiles = ['debug', 'preview'];

const profile = process.argv[2] || 'debug';
if (!supportedProfiles.includes(profile)) {
  console.error(`\x1b[31m❌ Unknown profile "${profile}". Use one of: ${supportedProfiles.join(', ')}\x1b[0m`);
  process.exit(1);
}

const buildEnv = { ...process.env, EAS_BUILD_PROFILE: profile, SENTRY_DISABLE_AUTO_UPLOAD: 'true' };
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

function run(command, cwd) {
  console.log(`\x1b[36m> ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', shell: true, cwd, env: buildEnv });
}

function prebuildPreservingPackageJson() {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const originalPackageJson = fs.readFileSync(packageJsonPath);
  try {
    run('npx expo prebuild --platform android --clean --no-install', rootDir);
  } finally {
    fs.writeFileSync(packageJsonPath, originalPackageJson);
  }
}

console.log(`\x1b[1m📱 Building local ${profile} APK (version ${version})...\x1b[0m\n`);
prebuildPreservingPackageJson();
run(`${gradleCommand} assembleRelease`, androidDir);

const builtApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!fs.existsSync(builtApk)) {
  console.error(`\x1b[31m❌ Gradle finished but the APK was not found at ${builtApk}\x1b[0m`);
  process.exit(1);
}

const targetApk = path.join(outputDir, `masa-daf-${version}-${profile}.apk`);
fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(builtApk, targetApk);
console.log(`\n\x1b[32m✅ APK ready: ${targetApk}\x1b[0m`);
