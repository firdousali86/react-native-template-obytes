import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';

class NotificationHelper {
  private fcmToken: string | null = null;

  async initialize(): Promise<void> {
    await this.requestUserPermission();
    await this.registerAppWithFCM();
    await this.checkInitialNotification();
    await this.retrieveFCMToken();
    this.onTokenRefreshListener();
    this.onMessageListener();
    this.onBackgroundMessageListener();
    this.onNotificationOpenedAppListener();
  }

  private async requestUserPermission(): Promise<void> {
    try {
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  private async registerAppWithFCM(): Promise<void> {
    try {
      await messaging().registerDeviceForRemoteMessages();
    } catch (error) {
      console.error('Error registering app with FCM:', error);
    }
  }

  private async checkInitialNotification(): Promise<void> {
    try {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('Opened from notification:', initialNotification);
        // Handle the initial notification when the app is opened from it.
        this.handleNotificationOpened(initialNotification);
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
    }
  }

  private async retrieveFCMToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        console.log('FCM Token:', token);
      }
    } catch (error) {
      console.error('Error retrieving FCM token:', error);
    }
  }

  private onTokenRefreshListener(): void {
    messaging().onTokenRefresh((newToken) => {
      console.log('Refreshed FCM token:', newToken);
      this.fcmToken = newToken;
      // Send the new token to your server or update it in your state.
    });
  }

  private onMessageListener(): () => void {
    const unsubscribe = messaging().onMessage(
      async (
        remoteMessage: FirebaseMessagingTypes.RemoteMessage
      ): Promise<void> => {
        console.log('Received FCM message:', remoteMessage);
        // Handle the incoming message.
        this.handleMessage(remoteMessage);
      }
    );

    return unsubscribe;
  }

  private onBackgroundMessageListener(): void {
    messaging().setBackgroundMessageHandler(
      async (
        remoteMessage: FirebaseMessagingTypes.RemoteMessage
      ): Promise<void> => {
        console.log('Received background FCM message:', remoteMessage);
        // Handle the background message.
        this.handleMessage(remoteMessage);
      }
    );
  }

  private onNotificationOpenedAppListener(): () => void {
    const unsubscribe = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage): void => {
        console.log('Opened from notification in foreground:', remoteMessage);
        // Handle the notification when the app is already open.
        this.handleNotificationOpened(remoteMessage);
      }
    );

    return unsubscribe;
  }

  private handleNotificationOpened(
    notification: FirebaseMessagingTypes.RemoteMessage
  ): void {
    // Implement your custom logic to handle the notification when the app is opened from it.
    // This could involve navigating to a specific screen or performing an action.
    console.log(notification);
  }

  private handleMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    // Implement your custom logic to handle the incoming message.
    // This method will be called for both foreground and background messages.
    console.log(remoteMessage);
  }
}

export default new NotificationHelper();
