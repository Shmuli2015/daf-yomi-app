const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = 'DAF_YOMI_DISMISS_ON_ACTION';

const SEARCH = `  override fun handleNotificationResponse(notificationResponse: NotificationResponse) {
    if (notificationResponse.action.opensAppToForeground()) {
      openAppToForeground(context, notificationResponse)
    }`;

const REPLACE = `  override fun handleNotificationResponse(notificationResponse: NotificationResponse) {
    // ${MARKER}: dismiss tray immediately for custom actions without opening the app
    if (notificationResponse.actionIdentifier != NotificationResponse.DEFAULT_ACTION_IDENTIFIER) {
      val identifier = notificationResponse.notification.notificationRequest.identifier
      NotificationsService.dismiss(context, arrayOf(identifier))
    }

    if (notificationResponse.action.opensAppToForeground()) {
      openAppToForeground(context, notificationResponse)
    }`;

function patchExpoHandlingDelegate(projectRoot) {
  const filePath = path.join(
    projectRoot,
    'node_modules',
    'expo-notifications',
    'android',
    'src',
    'main',
    'java',
    'expo',
    'modules',
    'notifications',
    'service',
    'delegates',
    'ExpoHandlingDelegate.kt',
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `withDismissNotificationOnAction: missing ExpoHandlingDelegate.kt at ${filePath}`,
    );
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  if (contents.includes(MARKER)) {
    return;
  }

  if (!contents.includes(SEARCH)) {
    throw new Error(
      'withDismissNotificationOnAction: ExpoHandlingDelegate.kt pattern not found; expo-notifications may have changed',
    );
  }

  fs.writeFileSync(filePath, contents.replace(SEARCH, REPLACE));
}

function withDismissNotificationOnAction(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      patchExpoHandlingDelegate(config.modRequest.projectRoot);
      return config;
    },
  ]);
}

module.exports = withDismissNotificationOnAction;
