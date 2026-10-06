const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = 'DAF_YOMI_DISMISS_ON_ACTION_DIRECT';
const LEGACY_MARKER = 'DAF_YOMI_DISMISS_ON_ACTION';

const SEARCH = `  override fun handleNotificationResponse(notificationResponse: NotificationResponse) {
    if (notificationResponse.action.opensAppToForeground()) {
      openAppToForeground(context, notificationResponse)
    }`;

const DISMISS_BLOCK = `    // ${MARKER}
    if (notificationResponse.actionIdentifier != NotificationResponse.DEFAULT_ACTION_IDENTIFIER) {
      val identifier = notificationResponse.notification.notificationRequest.identifier
      val compat = NotificationManagerCompat.from(context)
      val systemManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        for (active in systemManager.activeNotifications) {
          if (active.tag == identifier) {
            compat.cancel(active.tag, active.id)
          }
        }
      }
      compat.cancel(identifier, 0)
    }

`;

const REPLACE = `  override fun handleNotificationResponse(notificationResponse: NotificationResponse) {
${DISMISS_BLOCK}    if (notificationResponse.action.opensAppToForeground()) {
      openAppToForeground(context, notificationResponse)
    }`;

const LEGACY_BLOCK = `    // ${LEGACY_MARKER}: dismiss tray immediately for custom actions without opening the app
    if (notificationResponse.actionIdentifier != NotificationResponse.DEFAULT_ACTION_IDENTIFIER) {
      val identifier = notificationResponse.notification.notificationRequest.identifier
      NotificationsService.dismiss(context, arrayOf(identifier))
    }

`;

const COMPAT_IMPORT = 'import androidx.core.app.NotificationManagerCompat\n';

function ensureCompatImport(contents) {
  if (contents.includes('import androidx.core.app.NotificationManagerCompat')) {
    return contents;
  }
  const lifecycleImport = 'import androidx.lifecycle.Lifecycle\n';
  if (contents.includes(lifecycleImport)) {
    return contents.replace(lifecycleImport, `${COMPAT_IMPORT}${lifecycleImport}`);
  }
  return contents.replace(
    'import android.util.Log\n',
    `import android.util.Log\n${COMPAT_IMPORT}`,
  );
}

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

  let next = ensureCompatImport(contents);

  if (next.includes(LEGACY_BLOCK)) {
    next = next.replace(LEGACY_BLOCK, DISMISS_BLOCK);
  } else if (next.includes(SEARCH)) {
    next = next.replace(SEARCH, REPLACE);
  } else {
    throw new Error(
      'withDismissNotificationOnAction: ExpoHandlingDelegate.kt pattern not found; expo-notifications may have changed',
    );
  }

  fs.writeFileSync(filePath, next);
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
