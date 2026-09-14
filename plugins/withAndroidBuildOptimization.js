const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

function withAndroidBuildOptimization(config) {
  config = withGradleProperties(config, (mod) => {
    mod.modResults = mod.modResults.filter(
      (item) =>
        ![
          'reactNativeArchitectures',
          'android.enableMinifyInReleaseBuilds',
          'android.enableShrinkResourcesInReleaseBuilds',
        ].includes(item.key),
    );
    mod.modResults.push(
      { type: 'property', key: 'reactNativeArchitectures', value: 'armeabi-v7a,arm64-v8a' },
      { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'true' },
      { type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
    );
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes('abiFilters')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'defaultConfig {',
        "defaultConfig {\n        ndk {\n            abiFilters (*(findProperty('reactNativeArchitectures')?.split(',') ?: ['armeabi-v7a', 'arm64-v8a']))\n        }",
      );
    }
    return mod;
  });

  return config;
}

module.exports = withAndroidBuildOptimization;
