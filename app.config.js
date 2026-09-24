const { version } = require('./package.json');

module.exports = {
  expo: {
    name: 'מסע דף',
    slug: 'daf-yomi-app',
    scheme: 'dafyomi',
    version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.masadaf.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['SCHEDULE_EXACT_ALARM'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-sqlite',
      '@react-native-community/datetimepicker',
      'expo-font',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#C9963C',
        },
      ],
      'expo-sharing',
      'expo-status-bar',
      './plugins/withAndroidBuildOptimization.js',
      './plugins/withDismissNotificationOnAction.js',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://de.sentry.io/',
          organization: 'shmuli',
          project: 'react-native',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'ee12a724-804d-4143-8983-39e2e74f4339',
      },
      /** GitHub Releases API: public repo, no token required */
      githubOwner: 'Shmuli2015',
      githubRepo: 'daf-yomi-app',
      /** APK asset prefix on releases (מסע דף → masa-daf-1.2.3.apk) */
      releaseApkBasename: 'masa-daf',
      updateCheckEnabled: process.env.EAS_BUILD_PROFILE === 'preview',
      downloadPageUrl: 'https://shmuli2015.github.io/daf-yomi-app/',
      privacyPolicyUrl: 'https://shmuli2015.github.io/daf-yomi-app/privacy.html',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    },
  },
};
