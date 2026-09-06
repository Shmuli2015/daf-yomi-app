const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const pushAutoRegistrationStub = path.resolve(
  __dirname,
  'src/shims/expoNotificationsAutoRegistration.ts',
);
const topicSubscriptionStub = path.resolve(
  __dirname,
  'src/shims/expoTopicSubscriptionModule.ts',
);

const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromNotifications = context.originModulePath?.includes(
    `${path.sep}expo-notifications${path.sep}`,
  );

  if (fromNotifications) {
    if (
      moduleName === './DevicePushTokenAutoRegistration.fx' ||
      moduleName.endsWith('DevicePushTokenAutoRegistration.fx.js') ||
      moduleName.endsWith('DevicePushTokenAutoRegistration.fx')
    ) {
      return { filePath: pushAutoRegistrationStub, type: 'sourceFile' };
    }

    // Android resolves ./TopicSubscriptionModule -> TopicSubscriptionModule.android,
    // which requireNativeModule('ExpoTopicSubscriptionModule') — missing in Expo Go.
    if (
      platform === 'android' &&
      (moduleName === './TopicSubscriptionModule' ||
        moduleName.endsWith('TopicSubscriptionModule.android') ||
        moduleName.endsWith('TopicSubscriptionModule.android.js') ||
        moduleName.endsWith('TopicSubscriptionModule.android.ts'))
    ) {
      return { filePath: topicSubscriptionStub, type: 'sourceFile' };
    }
  }

  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
