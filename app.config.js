const { version } = require('./package.json');

module.exports = {
  expo: {
    name: 'מסע דף',
    slug: 'daf-yomi-app',
    scheme: 'dafyomi',
    version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.shmuli.dafyomi',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['USE_EXACT_ALARM', 'SCHEDULE_EXACT_ALARM'],
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
      [
        'react-native-android-widget',
        {
          widgets: [
            {
              name: 'DafYomiWidget',
              label: 'מסע דף – דף יומי',
              minWidth: '130dp',
              minHeight: '60dp',
              targetCellWidth: 3,
              targetCellHeight: 2,
              description: 'הדף היומי ואפשרות לסמן למדתי',
              updatePeriodMillis: 1800000,
            },
          ],
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'ee12a724-804d-4143-8983-39e2e74f4339',
      },
    },
  },
};
