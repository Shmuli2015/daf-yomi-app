/**
 * No-op TopicSubscriptionModule for Expo Go / apps that don't use FCM topics.
 * Expo Go Android does not ship ExpoTopicSubscriptionModule; importing
 * expo-notifications would otherwise crash at requireNativeModule.
 */
const module = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: async () => null,
  unsubscribeFromTopicAsync: async () => null,
};

export default module;
