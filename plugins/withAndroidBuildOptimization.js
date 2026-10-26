const { withAppBuildGradle, withGradleProperties, withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAndroidBuildOptimization(config) {
  config = withAndroidManifest(config, (mod) => {
    const mainApplication = mod.modResults.manifest.application?.[0];
    if (mainApplication) {
      mainApplication.$['android:usesCleartextTraffic'] = 'false';
    }
    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const proguardFile = path.join(mod.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
      if (fs.existsSync(proguardFile)) {
        const content = fs.readFileSync(proguardFile, 'utf8');
        if (!content.includes('expo.modules.**')) {
          fs.writeFileSync(proguardFile, `${content.trimEnd()}\n-keep class expo.modules.** { *; }\n`, 'utf8');
        }
      }
      return mod;
    },
  ]);
  config = withGradleProperties(config, (mod) => {
    mod.modResults = mod.modResults.filter(
      (item) =>
        ![
          'reactNativeArchitectures',
          'android.enableMinifyInReleaseBuilds',
          'android.enableShrinkResourcesInReleaseBuilds',
          'android.r8.optimizedResourceShrinking',
        ].includes(item.key),
    );
    mod.modResults.push(
      { type: 'property', key: 'reactNativeArchitectures', value: 'armeabi-v7a,arm64-v8a' },
      { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'true' },
      { type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
      { type: 'property', key: 'android.r8.optimizedResourceShrinking', value: 'true' },
    );
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes('proguard-android.txt')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'proguard-android.txt',
        'proguard-android-optimize.txt',
      );
    }
    if (!mod.modResults.contents.includes('abiFilters')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'defaultConfig {',
        "defaultConfig {\n        ndk {\n            abiFilters (*(findProperty('reactNativeArchitectures')?.split(',') ?: ['armeabi-v7a', 'arm64-v8a']))\n        }",
      );
    }
    const unusedFonts = ':AntDesign.ttf:Entypo.ttf:EvilIcons.ttf:Feather.ttf:FontAwesome*.ttf:Fontisto.ttf:Foundation.ttf:MaterialCommunityIcons.ttf:MaterialIcons.ttf:Octicons.ttf:SimpleLineIcons.ttf:Zocial.ttf';
    if (mod.modResults.contents.includes('ignoreAssetsPattern') && !mod.modResults.contents.includes('MaterialCommunityIcons.ttf')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /ignoreAssetsPattern '([^']+)'/,
        `ignoreAssetsPattern '$1${unusedFonts}'`,
      );
    }
    return mod;
  });

  return config;
}

module.exports = withAndroidBuildOptimization;
